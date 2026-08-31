namespace :curriculum do
  desc "Load curriculum YAML files from db/curriculum into the database (idempotent)"
  task load: :environment do
    count = CurriculumLoader.load_all
    puts "Loaded #{count} curriculum file(s). " \
         "#{Domain.count} domains, #{Skill.count} skills, #{Activity.count} activities."
  end
end
