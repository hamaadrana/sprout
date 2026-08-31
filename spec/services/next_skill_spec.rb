require "rails_helper"

RSpec.describe NextSkill do
  let(:user) { User.create!(email: "parent@example.com", password: "password123") }
  let(:child) { Child.create!(user: user, name: "Ayesha", date_of_birth: 4.years.ago.to_date) }
  let(:domain) { Domain.create!(code: "NUM", name: "Numeracy", position: 1) }

  # Two parallel strands:
  #   counting: c1 -> c2 -> c3
  #   shapes:   s1 -> s2
  let!(:c1) { make_skill("NUM.01.c1", 10) }
  let!(:c2) { make_skill("NUM.02.c2", 20, prereqs: [ c1 ]) }
  let!(:c3) { make_skill("NUM.03.c3", 30, prereqs: [ c2 ]) }
  let!(:s1) { make_skill("NUM.10.s1", 100) }
  let!(:s2) { make_skill("NUM.11.s2", 110, prereqs: [ s1 ]) }

  before { ChildDomain.create!(child: child, domain: domain, active: true) }

  def make_skill(code, position, prereqs: [])
    skill = Skill.create!(
      domain: domain, code: code, position: position, title: code,
      mastery_descriptor: "does #{code}", age_min_months: 36, age_max_months: 72
    )
    prereqs.each { |p| SkillPrerequisite.create!(skill: skill, prerequisite_skill: p) }
    skill
  end

  def set_progress(skill, state)
    SkillProgress.create!(child: child, skill: skill, state: state)
  end

  context "with empty progress" do
    it "returns the lowest-position skill with no prerequisites" do
      expect(NextSkill.for(child)).to eq([ c1 ])
    end

    it "never returns a skill with unmet prerequisites" do
      expect(NextSkill.for(child, limit: 5)).to eq([ c1, s1 ])
    end
  end

  context "mid-sequence" do
    before { set_progress(c1, :mastered) }

    it "advances to the next skill in the strand" do
      expect(NextSkill.for(child)).to eq([ c2 ])
    end

    it "prefers a started-but-unmastered skill over an untouched one" do
      set_progress(s1, :practising)
      expect(NextSkill.for(child)).to eq([ s1 ])
    end

    it "counts introduced skills as started" do
      set_progress(s1, :introduced)
      expect(NextSkill.for(child)).to eq([ s1 ])
    end
  end

  context "parallel strands" do
    before do
      set_progress(c1, :mastered)
      set_progress(c2, :mastered)
    end

    it "keeps both strands available independently" do
      expect(NextSkill.for(child, limit: 5)).to eq([ c3, s1 ])
    end

    it "progress deep in one strand does not unlock the other strand's gated skills" do
      set_progress(c3, :mastered)
      expect(NextSkill.for(child, limit: 5)).to eq([ s1 ])
    end
  end

  context "all mastered" do
    it "returns an empty array" do
      [ c1, c2, c3, s1, s2 ].each { |sk| set_progress(sk, :mastered) }
      expect(NextSkill.for(child)).to eq([])
    end
  end

  context "domain activation" do
    it "ignores skills in inactive domains" do
      child.child_domains.first.update!(active: false)
      expect(NextSkill.for(child, limit: 5)).to eq([])
    end

    it "ignores skills in domains the child never enabled" do
      other = Domain.create!(code: "URD", name: "Urdu", position: 2)
      Skill.create!(domain: other, code: "URD.01.x", position: 1, title: "x",
                    mastery_descriptor: "x", age_min_months: 36, age_max_months: 72)
      expect(NextSkill.for(child, limit: 10).map(&:code)).not_to include("URD.01.x")
    end
  end
end
