require "rails_helper"

RSpec.describe "Worksheets", type: :request do
  include Devise::Test::IntegrationHelpers

  TEMPLATES = {
    "numeral_tracing" => { "numerals" => [ 1, 2, 3 ], "repetitions" => 4, "guide_style" => "dashed" },
    "count_and_write" => { "max_count" => 10, "item_count" => 6 },
    "count_and_circle" => { "target_number" => 5, "distractor_range" => 4 },
    "ten_frame" => { "numbers" => [ 4, 6, 7, 8 ] },
    "match_quantity_numeral" => { "number_range" => [ 1, 10 ], "pair_count" => 5 },
    "more_or_less" => { "pair_count" => 5, "max_quantity" => 5 },
    "pattern_completion" => { "pattern_type" => "AB", "length" => 8 },
    "shape_tracing" => { "shapes" => [ "circle", "square", "triangle" ] },
    "size_ordering" => { "shape" => "circle", "item_count" => 4 }
  }.freeze

  let(:user) { User.create!(email: "p@example.com", password: "password123") }
  let(:child) { Child.create!(user: user, name: "Ayesha", date_of_birth: 4.years.ago.to_date) }
  let(:domain) { Domain.create!(code: "NUM", name: "Numeracy", position: 1) }

  before { sign_in user }

  TEMPLATES.each do |template, params|
    it "renders the #{template} worksheet" do
      skill = Skill.create!(domain: domain, code: "NUM.#{template}", position: 1,
                            title: template.humanize, mastery_descriptor: "d",
                            age_min_months: 36, age_max_months: 72)
      activity = Activity.create!(skill: skill, title: "Sheet", kind: :worksheet,
                                  instructions: "i", duration_minutes: 10, position: 1)
      Resource.create!(activity: activity, kind: :generated_worksheet,
                       worksheet_template: template, worksheet_params: params)
      item = PlanItem.create!(child: child, skill: skill, activity: activity,
                              scheduled_on: Date.current, position: 1)

      get plan_item_worksheet_path(item)
      expect(response).to have_http_status(:ok), "#{template}: #{response.status}"
      expect(response.body).to include(child.name)
      expect(response.body).to include(skill.title)
    end
  end

  it "404s when the activity has no worksheet" do
    skill = Skill.create!(domain: domain, code: "NUM.x", position: 1, title: "x",
                          mastery_descriptor: "d", age_min_months: 36, age_max_months: 72)
    activity = Activity.create!(skill: skill, title: "a", kind: :hands_on,
                                instructions: "i", duration_minutes: 10, position: 1)
    item = PlanItem.create!(child: child, skill: skill, activity: activity,
                            scheduled_on: Date.current, position: 1)

    get plan_item_worksheet_path(item)
    expect(response).to have_http_status(:not_found)
  end

  it "serves the identical sheet on re-print and a different one for a new variant" do
    params = TEMPLATES["count_and_write"]
    skill = Skill.create!(domain: domain, code: "NUM.det", position: 1, title: "det",
                          mastery_descriptor: "d", age_min_months: 36, age_max_months: 72)
    activity = Activity.create!(skill: skill, title: "Sheet", kind: :worksheet,
                                instructions: "i", duration_minutes: 10, position: 1)
    Resource.create!(activity: activity, kind: :generated_worksheet,
                     worksheet_template: "count_and_write", worksheet_params: params)
    item = PlanItem.create!(child: child, skill: skill, activity: activity,
                            scheduled_on: Date.current, position: 1)

    get plan_item_worksheet_path(item)
    first_body = response.body
    get plan_item_worksheet_path(item)
    expect(response.body).to eq(first_body)

    get plan_item_worksheet_path(item, variant: 1)
    expect(response.body).not_to eq(first_body)
  end
end
