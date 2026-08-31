require "rails_helper"

RSpec.describe WorksheetBuilder do
  describe "count_and_write" do
    let(:params) { { "max_count" => 10, "item_count" => 6 } }

    it "is deterministic for the same seed (re-print gives the same sheet)" do
      a = WorksheetBuilder.build(template: "count_and_write", params: params, seed: 42)
      b = WorksheetBuilder.build(template: "count_and_write", params: params, seed: 42)
      expect(a).to eq(b)
    end

    it "differs for a different seed (new practice gives a new sheet)" do
      a = WorksheetBuilder.build(template: "count_and_write", params: params, seed: 42)
      b = WorksheetBuilder.build(template: "count_and_write", params: params, seed: 43)
      expect(a).not_to eq(b)
    end

    it "respects max_count and item_count" do
      sheet = WorksheetBuilder.build(template: "count_and_write", params: params, seed: 7)
      expect(sheet[:items].length).to eq(6)
      expect(sheet[:items].map { |i| i[:count] }).to all(be_between(1, 10))
      expect(sheet[:items].map { |i| i[:object] }).to all(be_in(WorksheetBuilder::OBJECTS))
    end
  end

  describe "numeral_tracing" do
    it "renders one row per numeral with the configured repetitions" do
      sheet = WorksheetBuilder.build(
        template: "numeral_tracing",
        params: { "numerals" => [ 1, 2, 3 ], "repetitions" => 4 },
        seed: 1
      )
      expect(sheet[:rows].map { |r| r[:numeral] }).to eq([ 1, 2, 3 ])
      expect(sheet[:rows].map { |r| r[:repetitions] }).to all(eq(4))
    end
  end

  it "raises on an unknown template" do
    expect {
      WorksheetBuilder.build(template: "wat", params: {}, seed: 1)
    }.to raise_error(ArgumentError)
  end
end

RSpec.describe WorksheetSeed do
  let(:user) { User.create!(email: "p@example.com", password: "password123") }
  let(:child) { Child.create!(user: user, name: "A", date_of_birth: 4.years.ago.to_date) }
  let(:domain) { Domain.create!(code: "NUM", name: "Numeracy", position: 1) }
  let(:skill) do
    Skill.create!(domain: domain, code: "NUM.01.x", position: 1, title: "x",
                  mastery_descriptor: "x", age_min_months: 36, age_max_months: 72)
  end

  it "is stable for the same child, skill, date and variant" do
    expect(WorksheetSeed.for(child: child, skill: skill, date: Date.new(2026, 8, 31)))
      .to eq(WorksheetSeed.for(child: child, skill: skill, date: Date.new(2026, 8, 31)))
  end

  it "changes with the variant" do
    date = Date.new(2026, 8, 31)
    expect(WorksheetSeed.for(child: child, skill: skill, date: date, variant: 1))
      .not_to eq(WorksheetSeed.for(child: child, skill: skill, date: date, variant: 0))
  end
end
