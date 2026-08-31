require "rails_helper"

RSpec.describe CurriculumLoader do
  describe ".load_all with the real curriculum" do
    it "loads and is idempotent, keeping skill ids stable across reloads" do
      CurriculumLoader.load_all

      expect(Domain.find_by(code: "NUM")).to be_present
      expect(Skill.count).to be > 20
      expect(Activity.count).to be > 30

      ids_before = Skill.order(:code).pluck(:id)
      counts_before = [ Domain.count, Skill.count, Activity.count, SkillPrerequisite.count ]

      CurriculumLoader.load_all

      expect(Skill.order(:code).pluck(:id)).to eq(ids_before)
      expect([ Domain.count, Skill.count, Activity.count, SkillPrerequisite.count ]).to eq(counts_before)
    end

    it "loads a valid, acyclic prerequisite graph with every ref resolving" do
      expect { CurriculumLoader.load_all }.not_to raise_error
      expect(SkillPrerequisite.count).to be > 10
    end

    it "gives every skill at least one SLO reference and one activity" do
      CurriculumLoader.load_all
      expect(Skill.where(slo_refs: [])).to be_empty
      expect(Skill.left_joins(:activities).where(activities: { id: nil })).to be_empty
    end
  end

  describe "failure modes" do
    def write_curriculum(dir, body)
      File.write(File.join(dir, "test.yml"), body)
      Pathname.new(dir)
    end

    it "raises on a prerequisite cycle" do
      Dir.mktmpdir do |dir|
        path = write_curriculum(dir, <<~YAML)
          domain: { code: TST, name: Test, position: 99 }
          skills:
            - { code: TST.01.a, position: 1, title: A, mastery_descriptor: a,
                age_min_months: 36, age_max_months: 72, slo_refs: [X-1],
                prerequisites: [TST.02.b] }
            - { code: TST.02.b, position: 2, title: B, mastery_descriptor: b,
                age_min_months: 36, age_max_months: 72, slo_refs: [X-2],
                prerequisites: [TST.01.a] }
        YAML
        expect { CurriculumLoader.load_all(path) }.to raise_error(CurriculumLoader::CycleError)
      end
    end

    it "raises on an unknown prerequisite code" do
      Dir.mktmpdir do |dir|
        path = write_curriculum(dir, <<~YAML)
          domain: { code: TST, name: Test, position: 99 }
          skills:
            - { code: TST.01.a, position: 1, title: A, mastery_descriptor: a,
                age_min_months: 36, age_max_months: 72, slo_refs: [X-1],
                prerequisites: [TST.99.nope] }
        YAML
        expect { CurriculumLoader.load_all(path) }
          .to raise_error(CurriculumLoader::UnknownPrerequisiteError)
      end
    end

    it "rolls back everything when a file is invalid" do
      Dir.mktmpdir do |dir|
        path = write_curriculum(dir, <<~YAML)
          domain: { code: TST, name: Test, position: 99 }
          skills:
            - { code: TST.01.a, position: 1, title: A, mastery_descriptor: a,
                age_min_months: 36, age_max_months: 72, slo_refs: [X-1],
                prerequisites: [TST.99.nope] }
        YAML
        expect { CurriculumLoader.load_all(path) rescue nil }.not_to change(Domain, :count)
      end
    end
  end
end
