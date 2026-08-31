# Loads db/curriculum/*.yml into the database. Idempotent: domains and skills
# are upserted on their stable `code`, so reloading never duplicates rows or
# breaks child progress. Skills removed from YAML are left in the database —
# user progress may reference them.
class CurriculumLoader
  class CycleError < StandardError; end
  class UnknownPrerequisiteError < StandardError; end

  def self.load_all(dir = Rails.root.join("db/curriculum"))
    files = Dir.glob(dir.join("*.yml")).sort
    loaders = files.map { |f| new(f) }

    ActiveRecord::Base.transaction do
      # Two passes so prerequisites may reference skills from any file.
      loaders.each(&:load_skills)
      loaders.each(&:load_prerequisites)
      verify_acyclic!
    end
    loaders.size
  end

  def self.verify_acyclic!
    graph = SkillPrerequisite.pluck(:skill_id, :prerequisite_skill_id)
              .group_by(&:first).transform_values { |pairs| pairs.map(&:last) }
    state = Hash.new(:unvisited)
    graph.each_key do |node|
      next unless state[node] == :unvisited
      stack = [ [ node, 0 ] ]
      until stack.empty?
        current, _ = stack.last
        if state[current] == :unvisited
          state[current] = :in_progress
          (graph[current] || []).each do |dep|
            if state[dep] == :in_progress
              codes = Skill.where(id: [ current, dep ]).pluck(:code)
              raise CycleError, "Prerequisite cycle detected involving #{codes.join(', ')}"
            end
            stack.push([ dep, 0 ]) if state[dep] == :unvisited
          end
        else
          state[current] = :done
          stack.pop
        end
      end
    end
    true
  end

  def initialize(path)
    @path = path
    @data = YAML.safe_load_file(path)
  end

  def load_skills
    domain_attrs = @data.fetch("domain")
    domain = Domain.find_or_initialize_by(code: domain_attrs.fetch("code"))
    domain.update!(
      name: domain_attrs.fetch("name"),
      name_ur: domain_attrs["name_ur"],
      position: domain_attrs.fetch("position")
    )

    @data.fetch("skills", []).each do |skill_attrs|
      skill = Skill.find_or_initialize_by(code: skill_attrs.fetch("code"))
      skill.update!(
        domain: domain,
        position: skill_attrs.fetch("position"),
        title: skill_attrs.fetch("title"),
        mastery_descriptor: skill_attrs.fetch("mastery_descriptor"),
        age_min_months: skill_attrs.fetch("age_min_months"),
        age_max_months: skill_attrs.fetch("age_max_months"),
        slo_refs: skill_attrs.fetch("slo_refs", []),
        school_readiness: skill_attrs.fetch("school_readiness", false)
      )
      load_activities(skill, skill_attrs.fetch("activities", []))
    end
  end

  def load_prerequisites
    @data.fetch("skills", []).each do |skill_attrs|
      skill = Skill.find_by!(code: skill_attrs.fetch("code"))
      prereq_ids = skill_attrs.fetch("prerequisites", []).map do |code|
        Skill.find_by(code: code)&.id ||
          raise(UnknownPrerequisiteError, "#{skill.code} references unknown prerequisite #{code}")
      end

      skill.skill_prerequisites.where.not(prerequisite_skill_id: prereq_ids).destroy_all
      prereq_ids.each do |id|
        skill.skill_prerequisites.find_or_create_by!(prerequisite_skill_id: id)
      end
    end
  end

  private

  # Activities have no stable code; they are keyed on (skill, position).
  # Activities dropped from YAML are destroyed unless plan items reference them.
  def load_activities(skill, activities_attrs)
    positions = activities_attrs.each_with_index.map { |_, i| i + 1 }

    activities_attrs.each_with_index do |attrs, index|
      activity = skill.activities.find_or_initialize_by(position: index + 1)
      activity.update!(
        title: attrs.fetch("title"),
        kind: attrs.fetch("kind"),
        instructions: attrs.fetch("instructions"),
        materials: attrs.fetch("materials", []),
        duration_minutes: attrs.fetch("duration_minutes")
      )
      load_resources(activity, attrs.fetch("resources", []))
    end

    skill.activities.where.not(position: positions).find_each(&:destroy)
  end

  def load_resources(activity, resources_attrs)
    activity.resources.destroy_all
    resources_attrs.each do |attrs|
      activity.resources.create!(
        kind: attrs.fetch("kind"),
        url: attrs["url"],
        worksheet_template: attrs["worksheet_template"],
        worksheet_params: attrs.fetch("worksheet_params", {})
      )
    end
  end
end
