# Assembles the monthly report: consistency (measures the parent, not the
# child), coverage, and readiness against the national curriculum. One data
# set, two framings — the view only changes the words.
class ReportBuilder
  include Rails.application.routes.url_helpers

  THUMB = { resize_to_limit: [ 400, 400 ] }.freeze

  def initialize(child, month = Date.current.beginning_of_month)
    @child = child
    @month = month.beginning_of_month
  end

  def props
    {
      month: @month.strftime("%Y-%m"),
      month_label: @month.strftime("%B %Y"),
      prev_month: (@month << 1).strftime("%Y-%m"),
      next_month: @month.end_of_month < Date.current ? (@month >> 1).strftime("%Y-%m") : nil,
      framing: @child.framing,
      school_start: school_start_props,
      consistency: consistency_props,
      coverage: coverage_props,
      readiness: readiness_props,
      mastered_this_month: mastered_this_month,
      streak: current_streak,
      recent_photos: recent_photos
    }
  end

  private

  def school_start_props
    return nil if @child.target_school_start_on.blank?
    months_away = ((@child.target_school_start_on.year * 12 + @child.target_school_start_on.month) -
                   (Date.current.year * 12 + Date.current.month))
    {
      date_label: @child.target_school_start_on.strftime("%B %Y"),
      months_away: [ months_away, 0 ].max
    }
  end

  def consistency_props
    month_end = [ @month.end_of_month, Date.current ].min
    active = @child.log_entries.where(logged_on: @month..@month.end_of_month)
                   .distinct.pluck(:logged_on).to_set
    {
      active_days: active.size,
      total_days: @month.end_of_month.day,
      days: (1..@month.end_of_month.day).map do |day|
        date = @month + (day - 1)
        { day: day, active: active.include?(date), future: date > month_end }
      end
    }
  end

  def coverage_props
    skills = Skill.where(domain: @child.active_domains).includes(:domain)
    mastered_ids = @child.skill_progress.mastered.pluck(:skill_id).to_set

    {
      mastered: skills.count { |s| mastered_ids.include?(s.id) },
      total: skills.length,
      domains: skills.group_by(&:domain).sort_by { |d, _| d.position }.map do |domain, domain_skills|
        {
          name: domain.name,
          code: domain.code,
          mastered: domain_skills.count { |s| mastered_ids.include?(s.id) },
          total: domain_skills.length,
          strands: domain_skills.group_by(&:strand).map do |strand, list|
            {
              name: strand || "Other",
              mastered: list.count { |s| mastered_ids.include?(s.id) },
              total: list.length
            }
          end
        }
      end
    }
  end

  # Consecutive active days ending today or yesterday — the "don't break
  # the chain" number.
  def current_streak
    active = @child.log_entries.where(logged_on: 60.days.ago..Date.current)
                   .distinct.pluck(:logged_on).to_set
    day = active.include?(Date.current) ? Date.current : Date.current - 1
    streak = 0
    while active.include?(day)
      streak += 1
      day -= 1
    end
    streak
  end

  def recent_photos
    @child.portfolio_items.with_attached_image.order(taken_on: :desc, id: :desc)
          .limit(6).filter_map do |item|
      next unless item.image.attached?
      {
        id: item.id,
        caption: item.caption,
        thumb_url: rails_representation_path(item.image.variant(THUMB), only_path: true)
      }
    end
  end

  def readiness_props
    outcomes = Skill.where(domain: @child.active_domains, school_readiness: true).order(:position)
    progress = @child.skill_progress.where(skill_id: outcomes.map(&:id)).index_by(&:skill_id)

    rows = outcomes.map do |skill|
      state = progress[skill.id]&.state
      status =
        case state
        when "mastered" then "met"
        when "practising", "introduced" then "in_progress"
        else "not_yet"
        end
      { title: Pronouns.adapt(skill.title, @child.gender), status: status }
    end

    {
      met: rows.count { |r| r[:status] == "met" },
      total: rows.length,
      outcomes: featured_outcomes(rows)
    }
  end

  # The report lists a handful, not all: met first, then in progress, then
  # the next not-yets.
  def featured_outcomes(rows)
    rows.select { |r| r[:status] == "met" }.first(2) +
      rows.select { |r| r[:status] == "in_progress" }.first(2) +
      rows.select { |r| r[:status] == "not_yet" }.first(2)
  end

  def mastered_this_month
    @child.skill_progress.mastered
          .where(mastered_at: @month.beginning_of_day..@month.end_of_month.end_of_day)
          .count
  end
end
