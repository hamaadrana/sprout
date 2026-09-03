namespace :curriculum do
  desc "Load curriculum YAML files from db/curriculum into the database (idempotent)"
  task load: :environment do
    count = CurriculumLoader.load_all
    puts "Loaded #{count} curriculum file(s). " \
         "#{Domain.count} domains, #{Skill.count} skills, #{Activity.count} activities."
  end

  desc "Load the activity library and Make-It projects from db/library (idempotent)"
  task load_library: :environment do
    counts = LibraryLoader.load_all
    puts "#{counts[:activities]} library activities, #{counts[:projects]} make-it projects, " \
         "#{counts[:worksheets]} catalog worksheets."
  end
end
