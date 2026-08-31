class SkillsController < ApplicationController
  before_action :require_child!

  def index
    progress_by_skill = current_child.skill_progress.index_by(&:skill_id)
    mastered_ids = progress_by_skill.values.select(&:mastered?).map(&:skill_id).to_set

    domains = current_child.active_domains.order(:position).map do |domain|
      skills = domain.skills.includes(:prerequisites).order(:position)
      {
        code: domain.code,
        name: domain.name,
        name_ur: domain.name_ur,
        mastered_count: skills.count { |s| mastered_ids.include?(s.id) },
        skill_count: skills.length,
        skills: skills.map do |skill|
          progress = progress_by_skill[skill.id]
          unmet = skill.prerequisites.reject { |p| mastered_ids.include?(p.id) }
          {
            id: skill.id,
            code: skill.code,
            title: skill.title,
            mastery_descriptor: skill.mastery_descriptor,
            age_min_months: skill.age_min_months,
            age_max_months: skill.age_max_months,
            state: progress&.state || "not_started",
            ready: unmet.empty?,
            unmet_prerequisites: unmet.map(&:title)
          }
        end
      }
    end

    render inertia: "Skills/Index", props: {
      domains: domains,
      swap_plan_item_id: params[:swap].presence&.to_i
    }
  end

  def master
    skill = Skill.find(params[:id])
    progress = SkillProgress.find_or_create_by!(child: current_child, skill: skill)
    progress.update!(
      state: :mastered,
      mastered_at: Time.current,
      introduced_at: progress.introduced_at || Time.current
    )
    redirect_back fallback_location: skills_path
  end
end
