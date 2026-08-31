require "rails_helper"

RSpec.describe SessionLogger do
  let(:user) { User.create!(email: "parent@example.com", password: "password123") }
  let(:child) { Child.create!(user: user, name: "Ayesha", date_of_birth: 4.years.ago.to_date) }
  let(:domain) { Domain.create!(code: "NUM", name: "Numeracy", position: 1) }
  let(:skill) do
    Skill.create!(domain: domain, code: "NUM.01.x", position: 10, title: "x",
                  mastery_descriptor: "x", age_min_months: 36, age_max_months: 72)
  end
  let(:activity) do
    Activity.create!(skill: skill, title: "a", kind: :hands_on, instructions: "i",
                     duration_minutes: 10, position: 1)
  end

  def plan_item(position: 1, date: Date.current)
    PlanItem.create!(child: child, skill: skill, activity: activity,
                     scheduled_on: date, position: position)
  end

  it "creates a log entry and marks the plan item done in one go" do
    item = plan_item
    entry = SessionLogger.log(plan_item: item, outcome: :got_it, minutes: 10)

    expect(entry).to be_persisted
    expect(entry.skill).to eq(skill)
    expect(item.reload).to be_done
  end

  it "a single got_it leaves the skill practising" do
    SessionLogger.log(plan_item: plan_item, outcome: :got_it)
    progress = child.skill_progress.find_by!(skill: skill)

    expect(progress).to be_practising
    expect(progress.mastered_at).to be_nil
    expect(progress.attempts_count).to eq(1)
  end

  it "two consecutive got_its master the skill" do
    SessionLogger.log(plan_item: plan_item(position: 1), outcome: :got_it)
    SessionLogger.log(plan_item: plan_item(position: 2), outcome: :got_it)
    progress = child.skill_progress.find_by!(skill: skill)

    expect(progress).to be_mastered
    expect(progress.mastered_at).to be_present
    expect(progress.attempts_count).to eq(2)
  end

  it "needs_practice keeps the skill in rotation and resets the streak" do
    SessionLogger.log(plan_item: plan_item(position: 1), outcome: :got_it)
    SessionLogger.log(plan_item: plan_item(position: 2), outcome: :needs_practice)
    SessionLogger.log(plan_item: plan_item(position: 3), outcome: :got_it)
    progress = child.skill_progress.find_by!(skill: skill)

    expect(progress).to be_practising

    ChildDomain.create!(child: child, domain: domain)
    expect(NextSkill.for(child)).to eq([ skill ])
  end

  it "keeps the audit trail in log entries" do
    SessionLogger.log(plan_item: plan_item(position: 1), outcome: :got_it)
    SessionLogger.log(plan_item: plan_item(position: 2), outcome: :needs_practice)

    expect(child.log_entries.order(:id).map(&:outcome)).to eq(%w[got_it needs_practice])
  end
end
