class AddLibraryAndStrands < ActiveRecord::Migration[8.1]
  def change
    # Display grouping within a domain (Counting, Shape and space, …),
    # derived from the skill code's track letter at load time.
    add_column :skills, :strand, :string

    # Cross-domain browsable activities (activity_library.yml). Not gated by
    # prerequisites and not required for progression.
    create_table :library_activities do |t|
      t.string :code, null: false
      t.string :title, null: false
      t.string :domain_code, null: false
      t.string :age_band, null: false
      t.integer :duration_minutes, null: false, default: 10
      t.string :materials, array: true, null: false, default: []
      t.text :instructions, null: false
      t.text :variation
      t.boolean :supervision, null: false, default: false
      t.string :skill_tags, array: true, null: false, default: []
      t.timestamps
    end
    add_index :library_activities, :code, unique: true
    add_index :library_activities, [ :age_band, :domain_code ]

    # Make-It projects (make_it_projects.yml) — activities that end with a
    # physical artefact, prompting a portfolio photo.
    create_table :make_projects do |t|
      t.string :code, null: false
      t.string :title, null: false
      t.string :category, null: false
      t.string :age_band, null: false
      t.integer :duration_minutes, null: false, default: 20
      t.string :mess_level, null: false, default: "low"
      t.boolean :supervision, null: false, default: false
      t.string :occasion
      t.string :develops, array: true, null: false, default: []
      t.boolean :portfolio, null: false, default: false
      t.string :materials, array: true, null: false, default: []
      t.text :adult_prep
      t.string :steps, array: true, null: false, default: []
      t.string :skill_tags, array: true, null: false, default: []
      t.timestamps
    end
    add_index :make_projects, :code, unique: true
    add_index :make_projects, [ :age_band, :category ]
  end
end
