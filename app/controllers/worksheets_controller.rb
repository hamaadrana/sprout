class WorksheetsController < ApplicationController
  before_action :require_child!

  OVERRIDABLE = {
    "numeral_tracing" => %w[numerals repetitions guide_style],
    "letter_tracing" => %w[letters repetitions guide_style],
    "word_tracing" => %w[words repetitions]
  }.freeze

  # The catalog: every printable sheet, with the child's progress state on
  # the linked skill so the page can filter like the skill library does.
  def index
    progress_by_code = current_child.skill_progress.includes(:skill)
                                    .index_by { |p| p.skill.code }
    next_codes = NextSkill.for(current_child, limit: 4).map(&:code).to_set

    rows = Worksheet.order(:position).map do |sheet|
      {
        id: sheet.id,
        title: adapt(sheet.title),
        template: sheet.template,
        level: sheet.level,
        domain_code: sheet.domain_code,
        state: state_for(sheet.skill_code, progress_by_code, next_codes)
      }
    end

    render inertia: "Worksheets/Index", props: {
      rows: rows,
      domains: Domain.order(:position)
                     .select { |d| rows.any? { |r| r[:domain_code] == d.code } }
                     .map { |d| { code: d.code, name: d.name } }
    }
  end

  # The studio: preview + parameters + print.
  def studio
    sheet = Worksheet.find(params[:id])

    render inertia: "Worksheets/Studio", props: {
      sheet: { id: sheet.id, title: adapt(sheet.title), level: sheet.level },
      template: sheet.template,
      defaults: sheet.params,
      overridable: OVERRIDABLE.fetch(sheet.template, []),
      skill: sheet.skill && { id: sheet.skill.id, title: adapt(sheet.skill.title) }
    }
  end

  # The printable A4 sheet (loaded in the studio's iframe).
  def sheet
    record = Worksheet.find(params[:id])
    render_sheet(
      key: record.code,
      template: record.template,
      base_params: record.params,
      title: adapt(record.title),
      subtitle: record.skill ? adapt(record.skill.title) : nil,
      regen_url: sheet_worksheet_path(record.id, variant: next_variant, **overrides_for(record.template)),
      back_url: worksheet_studio_path(record.id)
    )
  end

  def show # legacy: by plan item, using the activity's inline worksheet
    plan_item = current_child.plan_items.find(params[:plan_item_id])
    resource = plan_item.activity.resources.generated_worksheet.first
    raise ActiveRecord::RecordNotFound, "No worksheet for this activity" if resource.nil?

    render_sheet(
      key: plan_item.skill.code,
      template: resource.worksheet_template,
      base_params: resource.worksheet_params,
      title: adapt(plan_item.skill.title),
      subtitle: adapt(plan_item.activity.title),
      regen_url: plan_item_worksheet_path(plan_item, variant: next_variant),
      back_url: today_path
    )
  end

  private

  def state_for(skill_code, progress_by_code, next_codes)
    progress = skill_code && progress_by_code[skill_code]
    if progress&.mastered? then "mastered"
    elsif progress&.practising? || progress&.introduced? then "practising"
    elsif next_codes.include?(skill_code) then "next"
    else "not_started"
    end
  end

  def render_sheet(key:, template:, base_params:, title:, subtitle:, regen_url:, back_url:)
    @variant = params.fetch(:variant, 0).to_i
    @bare = params[:bare].present?
    seed = WorksheetSeed.for(child: current_child, key: key, date: Date.current, variant: @variant)

    @worksheet = WorksheetBuilder.build(
      template: template,
      params: base_params.merge(overrides_for(template))
                         .merge("child_name" => current_child.name),
      seed: seed
    )
    @child = current_child
    @sheet_title = title
    @sheet_subtitle = subtitle
    @regen_url = regen_url
    @back_url = back_url
    render :show, layout: "worksheet"
  end

  def next_variant
    params.fetch(:variant, 0).to_i + 1
  end

  def overrides_for(template)
    keys = OVERRIDABLE.fetch(template, [])
    overrides = {}
    keys.each do |key|
      value = params[key]
      next if value.blank?
      overrides[key] =
        case key
        when "numerals" then value.to_s.split(",").map(&:to_i).reject(&:zero?).first(10)
        when "letters" then value.to_s.split(",").map { |l| l.strip[0, 2] }.reject(&:blank?).first(10)
        when "words" then value.to_s.split(",").map { |w| w.strip.gsub(/[^[:alpha:]'-]/, "")[0, 12] }.reject(&:blank?).first(6)
        when "repetitions" then value.to_i.clamp(2, 8)
        else value.to_s
        end
    end
    overrides
  end
end
