require "rails_helper"

RSpec.describe "Skill library", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:user) { User.create!(email: "parent@example.com", password: "password123") }
  let!(:child) { Child.create!(user: user, name: "Ayesha", date_of_birth: 4.years.ago.to_date) }
  let(:domain) { Domain.create!(code: "NUM", name: "Numeracy", position: 1) }
  let!(:skill_a) { make_skill("NUM.01.a", 10) }
  let!(:skill_b) { make_skill("NUM.02.b", 20) }

  def make_skill(code, position)
    skill = Skill.create!(domain: domain, code: code, position: position, title: code,
                          mastery_descriptor: "d", age_min_months: 36, age_max_months: 72)
    Activity.create!(skill: skill, title: "act", kind: :hands_on, instructions: "i",
                     duration_minutes: 10, position: 1)
    skill
  end

  before do
    ChildDomain.create!(child: child, domain: domain)
    sign_in user
  end

  it "renders the library" do
    get skills_path
    expect(response).to have_http_status(:ok)
    expect(response.body).to include("Skills/Index")
  end

  it "marks a skill mastered directly" do
    post master_skill_path(skill_a)
    progress = child.skill_progress.find_by!(skill: skill_a)
    expect(progress).to be_mastered
    expect(progress.mastered_at).to be_present
  end

  describe "swapping a plan item" do
    let!(:item) do
      PlanItem.create!(child: child, skill: skill_a, activity: skill_a.activities.first,
                       scheduled_on: Date.current, position: 1)
    end

    it "replaces the skill and activity and introduces the new skill" do
      patch plan_item_swap_path(item), params: { skill_id: skill_b.id }

      expect(item.reload.skill).to eq(skill_b)
      expect(item.activity).to eq(skill_b.activities.first)
      expect(child.skill_progress.find_by!(skill: skill_b)).to be_introduced
      expect(response).to redirect_to(root_path)
    end

    it "refuses to swap a plan item that is already done" do
      item.update!(state: :done)
      patch plan_item_swap_path(item), params: { skill_id: skill_b.id }
      expect(response).to have_http_status(:not_found)
      expect(item.reload.skill).to eq(skill_a)
    end

    it "cannot swap another family's plan item" do
      stranger = User.create!(email: "other@example.com", password: "password123")
      other_child = Child.create!(user: stranger, name: "X", date_of_birth: 4.years.ago.to_date)
      other_item = PlanItem.create!(child: other_child, skill: skill_a,
                                    activity: skill_a.activities.first,
                                    scheduled_on: Date.current, position: 1)

      patch plan_item_swap_path(other_item), params: { skill_id: skill_b.id }
      expect(response).to have_http_status(:not_found)
      expect(other_item.reload.skill).to eq(skill_a)
    end
  end
end
