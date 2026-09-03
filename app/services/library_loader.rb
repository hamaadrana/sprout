# Loads db/library/*.yml — the browsable activity library and Make-It
# projects. Idempotent, keyed on each record's stable `code`.
class LibraryLoader
  def self.load_all(dir = Rails.root.join("db/library"))
    counts = {}
    ActiveRecord::Base.transaction do
      counts[:activities] = load_activities(dir.join("activity_library.yml"))
      counts[:projects] = load_projects(dir.join("make_it_projects.yml"))
      counts[:worksheets] = load_worksheets(dir.join("worksheets.yml"))
    end
    counts
  end

  def self.load_worksheets(path)
    return 0 unless File.exist?(path)
    data = YAML.safe_load_file(path)

    data.fetch("worksheets", []).each_with_index do |attrs, index|
      skill_code = attrs["skill"]
      if skill_code.present? && !Skill.exists?(code: skill_code)
        raise "Worksheet #{attrs['code']} references unknown skill #{skill_code}"
      end

      record = Worksheet.find_or_initialize_by(code: attrs.fetch("code"))
      record.update!(
        title: attrs.fetch("title"),
        template: attrs.fetch("template"),
        params: attrs.fetch("params", {}),
        domain_code: attrs.fetch("domain"),
        skill_code: skill_code,
        level: attrs.fetch("level", 1),
        position: index + 1
      )
    end
    Worksheet.count
  end

  def self.load_activities(path)
    return 0 unless File.exist?(path)
    data = YAML.safe_load_file(path)

    data.fetch("activities", []).each do |attrs|
      record = LibraryActivity.find_or_initialize_by(code: attrs.fetch("code"))
      record.update!(
        title: attrs.fetch("title"),
        domain_code: attrs.fetch("domain"),
        age_band: attrs.fetch("age_band"),
        duration_minutes: attrs.fetch("duration_minutes"),
        materials: attrs.fetch("materials", []),
        instructions: attrs.fetch("instructions"),
        variation: attrs["variation"],
        supervision: attrs["supervision"] == "required",
        skill_tags: attrs.fetch("skill_tags", [])
      )
    end
    LibraryActivity.count
  end

  def self.load_projects(path)
    return 0 unless File.exist?(path)
    data = YAML.safe_load_file(path)

    data.fetch("projects", []).each do |attrs|
      record = MakeProject.find_or_initialize_by(code: attrs.fetch("code"))
      record.update!(
        title: attrs.fetch("title"),
        category: attrs.fetch("category"),
        age_band: attrs.fetch("age_band"),
        duration_minutes: attrs.fetch("duration_minutes"),
        mess_level: attrs.fetch("mess_level", "low"),
        supervision: attrs["supervision"] == "required",
        occasion: attrs["occasion"],
        develops: attrs.fetch("develops", []),
        portfolio: attrs.fetch("portfolio", false),
        materials: attrs.fetch("materials", []),
        adult_prep: attrs["adult_prep"],
        steps: attrs.fetch("steps", []),
        skill_tags: attrs.fetch("skill_tags", [])
      )
    end
    MakeProject.count
  end
end
