require "rails_helper"

RSpec.describe DailyPlan do
  include ActiveSupport::Testing::TimeHelpers

  let(:user) { User.create!(email: "parent@example.com", password: "password123") }
  let(:child) { Child.create!(user: user, name: "Ayesha", date_of_birth: 4.years.ago.to_date) }

  before do
    CurriculumLoader.load_all
    ChildDomain.create!(child: child, domain: Domain.find_by!(code: "NUM"))
  end

  it "persists up to two items and returns the same plan on re-read" do
    first_read = DailyPlan.for(child)
    second_read = DailyPlan.for(child)

    expect(first_read.length).to eq(2)
    expect(second_read.map(&:id)).to eq(first_read.map(&:id))
    expect(child.plan_items.count).to eq(2)
  end

  it "marks planned skills as introduced" do
    DailyPlan.for(child)
    states = child.skill_progress.pluck(:state).uniq
    expect(states).to eq([ "introduced" ])
  end

  it "advances the sequence day by day as skills are mastered (a week of use)" do
    mastered_over_time = []

    7.times do |day|
      travel_to Date.current + day do
        items = DailyPlan.for(child, date: Date.current)
        expect(items).not_to be_empty, "day #{day + 1} had an empty plan"

        items.each { |item| SessionLogger.log(plan_item: item, outcome: :got_it) }
        mastered_over_time << child.skill_progress.mastered.count
      end
    end

    # Two consecutive got_its master a skill, so mastery should keep growing.
    expect(mastered_over_time.last).to be > 0
    expect(mastered_over_time).to eq(mastered_over_time.sort)

    # And the plan must not serve the same two skills all week.
    distinct_skills = child.plan_items.distinct.count(:skill_id)
    expect(distinct_skills).to be > 2
  end
end
