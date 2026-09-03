class SkillsController < ApplicationController
  before_action :require_child!

  def index
    domains = current_child.active_domains.order(:position).to_a
    domain = domains.detect { |d| d.code == params[:domain] } || domains.first

    progress_by_skill = current_child.skill_progress.index_by(&:skill_id)
    mastered_ids = progress_by_skill.values.select(&:mastered?).map(&:skill_id).to_set
    next_ids = NextSkill.for(current_child, limit: 4).map(&:id).to_set

    skills = Skill.where(domain: domain).includes(:prerequisites).order(:position)

    strands = skills.group_by(&:strand).map do |strand, strand_skills|
      {
        name: strand || "Other",
        mastered: strand_skills.count { |s| mastered_ids.include?(s.id) },
        total: strand_skills.length,
        skills: strand_skills.map do |skill|
          skill_row(skill, progress_by_skill[skill.id], mastered_ids, next_ids)
        end
      }
    end

    selected = params[:skill].presence &&
               Skill.where(domain: domains).detect { |s| s.id == params[:skill].to_i }

    render inertia: "Skills/Index", props: {
      domain_code: domain&.code,
      domains: domains.map { |d| { code: d.code, name: d.name } },
      strands: strands,
      selected_skill: selected && selected_props(selected, progress_by_skill[selected.id])
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

  # Puts the chosen skill into today's plan: replaces the first pending item,
  # or appends a new one if today is already done.
  def teach_next
    skill = Skill.find(params[:id])
    activity = skill.activities.order(:position).last
    return redirect_back fallback_location: skills_path if activity.nil?

    ActiveRecord::Base.transaction do
      item = current_child.plan_items.for_day(Date.current).detect(&:pending?)
      if item
        item.update!(skill: skill, activity: activity)
      else
        position = (current_child.plan_items.for_day(Date.current).maximum(:position) || 0) + 1
        current_child.plan_items.create!(
          scheduled_on: Date.current, skill: skill, activity: activity,
          position: position, state: :pending
        )
      end

      progress = SkillProgress.find_or_create_by!(child: current_child, skill: skill)
      if progress.not_started?
        progress.update!(state: :introduced, introduced_at: Time.current)
      end
    end

    redirect_to today_path
  end

  private

  def skill_row(skill, progress, mastered_ids, next_ids)
    state =
      if progress&.mastered? then "mastered"
      elsif progress&.practising? then "practising"
      elsif progress&.introduced? then "introduced"
      elsif next_ids.include?(skill.id) then "next"
      elsif skill.prerequisites.any? { |p| !mastered_ids.include?(p.id) } then "locked"
      else "not_started"
      end

    { id: skill.id, code: skill.code, title: adapt(skill.title), state: state }
  end

  def selected_props(skill, progress)
    {
      id: skill.id,
      code: skill.code,
      title: adapt(skill.title),
      strand: skill.strand,
      mastery_descriptor: adapt(skill.mastery_descriptor),
      slo_refs: skill.slo_refs,
      age_min_months: skill.age_min_months,
      age_max_months: skill.age_max_months,
      attempts: progress&.attempts_count || 0,
      state: progress&.state || "not_started",
      worksheet_id: Worksheet.where(skill_code: skill.code)
                             .order(:level, :position).pick(:id)
    }
  end
end
