class WorksheetsController < ApplicationController
  before_action :require_child!

  OVERRIDABLE = {
    "numeral_tracing" => %w[numerals repetitions guide_style]
  }.freeze

  # All printable worksheets across the child's domains, grouped by strand.
  def index
    progress_by_skill = current_child.skill_progress.index_by(&:skill_id)

    rows = worksheet_skills.map do |skill|
      resource = worksheet_resource(skill)
      {
        skill_id: skill.id,
        title: skill.title,
        strand: skill.strand,
        template: resource.worksheet_template,
        state: progress_by_skill[skill.id]&.state || "not_started"
      }
    end

    render inertia: "Worksheets/Index", props: {
      rows: rows.group_by { |r| r[:strand] }.map { |strand, list| { strand: strand, rows: list } }
    }
  end

  # The studio: preview + parameters + print (wireframe 1g).
  def studio
    skill = worksheet_skills.detect { |s| s.id == params[:skill_id].to_i }
    raise ActiveRecord::RecordNotFound if skill.nil?
    resource = worksheet_resource(skill)

    render inertia: "Worksheets/Studio", props: {
      skill: { id: skill.id, title: skill.title },
      template: resource.worksheet_template,
      defaults: resource.worksheet_params,
      variant: params.fetch(:variant, 0).to_i,
      overridable: OVERRIDABLE.fetch(resource.worksheet_template, [])
    }
  end

  # The printable A4 sheet, rendered standalone (loaded in the studio's
  # iframe and by the legacy plan-item route).
  def sheet
    skill = worksheet_skills.detect { |s| s.id == params[:skill_id].to_i }
    raise ActiveRecord::RecordNotFound if skill.nil?
    render_sheet(skill)
  end

  def show # legacy: by plan item
    plan_item = current_child.plan_items.find(params[:plan_item_id])
    resource = plan_item.activity.resources.generated_worksheet.first
    raise ActiveRecord::RecordNotFound, "No worksheet for this activity" if resource.nil?
    render_sheet(plan_item.skill)
  end

  private

  def render_sheet(skill)
    resource = worksheet_resource(skill)
    raise ActiveRecord::RecordNotFound if resource.nil?

    @variant = params.fetch(:variant, 0).to_i
    @bare = params[:bare].present?
    seed = WorksheetSeed.for(
      child: current_child, skill: skill, date: Date.current, variant: @variant
    )
    @worksheet = WorksheetBuilder.build(
      template: resource.worksheet_template,
      params: effective_params(resource),
      seed: seed
    )
    @child = current_child
    @skill = skill
    @activity = resource.activity
    @regen_url = sheet_worksheet_path(@skill.id, variant: @variant + 1, **override_params(resource))
    render :show, layout: "worksheet"
  end

  def effective_params(resource)
    resource.worksheet_params.merge(override_params(resource))
  end

  def override_params(resource)
    keys = OVERRIDABLE.fetch(resource.worksheet_template, [])
    overrides = {}
    keys.each do |key|
      value = params[key]
      next if value.blank?
      overrides[key] =
        case key
        when "numerals" then value.to_s.split(",").map(&:to_i).reject(&:zero?).first(10)
        when "repetitions" then value.to_i.clamp(2, 8)
        else value.to_s
        end
    end
    overrides
  end

  def worksheet_skills
    @worksheet_skills ||= Skill.where(domain: current_child.active_domains)
      .includes(activities: :resources).order(:position)
      .select { |s| worksheet_resource(s).present? }
  end

  def worksheet_resource(skill)
    skill.activities.flat_map(&:resources).detect(&:generated_worksheet?)
  end
end
