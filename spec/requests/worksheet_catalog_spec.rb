require "rails_helper"

RSpec.describe "Worksheet catalog", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:user) { User.create!(email: "parent@example.com", password: "password123") }
  let(:child) { Child.create!(user: user, name: "Ayesha", date_of_birth: 4.years.ago.to_date, gender: "girl") }

  before do
    CurriculumLoader.load_all
    LibraryLoader.load_all
    Domain.find_each { |d| child.child_domains.create!(domain: d) }
    sign_in user
  end

  it "loads at least 100 catalog worksheets, all with valid templates and skills" do
    expect(Worksheet.count).to be >= 100
    expect(Worksheet.pluck(:template).uniq - Worksheet::TEMPLATES).to be_empty
    missing = Worksheet.where.not(skill_code: nil).pluck(:skill_code).uniq -
              Skill.pluck(:code)
    expect(missing).to be_empty
  end

  it "serves the index with filterable rows" do
    get worksheets_path
    expect(response).to have_http_status(:ok)
    expect(response.body).to include("Worksheets/Index")
    props = CGI.unescapeHTML(response.body)
    expect(props).to include('"rows":')
    expect(props).to include('"template":"numeral_tracing"')
    expect(props.scan('"state":').length).to be >= 100
  end

  it "reflects skill progress in the catalog state" do
    skill = Skill.find_by!(code: "NUM.B12.more_less")
    SkillProgress.create!(child: child, skill: skill, state: :mastered)

    get worksheets_path
    props = CGI.unescapeHTML(response.body)
    row = props[/"title":"More or less — up to 5".{0,120}/]
    expect(row).to include('"state":"mastered"')
  end

  it "renders a printable sheet for every template family" do
    %w[WS.NUM.002 WS.NUM.011 WS.NUM.016 WS.NUM.022 WS.NUM.030 WS.NUM.035
       WS.NUM.039 WS.NUM.044 WS.NUM.050 WS.NUM.053 WS.LIT.001 WS.LIT.013
       WS.LIT.018 WS.LIT.019 WS.ART.001].each do |code|
      sheet = Worksheet.find_by!(code: code)
      get sheet_worksheet_path(sheet.id, bare: 1)
      expect(response).to have_http_status(:ok), "#{code} failed: #{response.status}"
      expect(response.body).to include("Ayesha")
    end
  end

  it "gives identical output for the same variant and different for the next" do
    sheet = Worksheet.find_by!(code: "WS.NUM.014")
    get sheet_worksheet_path(sheet.id, bare: 1)
    first = response.body
    get sheet_worksheet_path(sheet.id, bare: 1)
    expect(response.body).to eq(first)
    get sheet_worksheet_path(sheet.id, bare: 1, variant: 1)
    expect(response.body).not_to eq(first)
  end
end
