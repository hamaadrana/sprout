# The activity library and Make-It projects: extra material the parent
# browses by choice. Not gated, not required for progression.
class ExtrasController < ApplicationController
  before_action :require_child!

  def index
    band = params[:age_band].presence || LibraryActivity.band_for_months(current_child.age_in_months)
    band = "3-4" unless LibraryActivity::AGE_BANDS.key?(band)

    render inertia: "Extras/Index", props: {
      age_band: band,
      age_bands: LibraryActivity::AGE_BANDS.keys,
      activities: LibraryActivity.for_age_band(band).order(:domain_code, :code).map do |a|
        {
          code: a.code,
          title: adapt(a.title),
          domain: a.domain_name,
          duration_minutes: a.duration_minutes,
          materials: a.materials,
          instructions: adapt(a.instructions),
          variation: adapt(a.variation),
          supervision: a.supervision
        }
      end,
      projects: MakeProject.for_age_band(band).order(:category, :code).map do |p|
        {
          code: p.code,
          title: adapt(p.title),
          category: p.category,
          duration_minutes: p.duration_minutes,
          mess_level: p.mess_level,
          supervision: p.supervision,
          occasion: p.occasion&.humanize,
          develops: p.develops,
          materials: p.materials,
          adult_prep: adapt(p.adult_prep),
          steps: p.steps.map { |s| adapt(s) },
          portfolio: p.portfolio
        }
      end
    }
  end
end
