class CreateCurriculumSchema < ActiveRecord::Migration[8.1]
  def change
    create_table :domains do |t|
      t.string :code, null: false
      t.string :name, null: false
      t.string :name_ur
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :domains, :code, unique: true

    create_table :skills do |t|
      t.references :domain, null: false, foreign_key: true
      t.string :code, null: false
      t.integer :position, null: false, default: 0
      t.string :title, null: false
      t.text :mastery_descriptor, null: false
      t.integer :age_min_months, null: false
      t.integer :age_max_months, null: false
      t.string :slo_refs, array: true, null: false, default: []
      t.boolean :school_readiness, null: false, default: false
      t.timestamps
    end
    add_index :skills, :code, unique: true
    add_index :skills, [ :domain_id, :position ]

    create_table :skill_prerequisites do |t|
      t.references :skill, null: false, foreign_key: true
      t.references :prerequisite_skill, null: false, foreign_key: { to_table: :skills }
      t.timestamps
    end
    add_index :skill_prerequisites, [ :skill_id, :prerequisite_skill_id ], unique: true

    create_table :activities do |t|
      t.references :skill, null: false, foreign_key: true
      t.string :title, null: false
      t.string :kind, null: false, default: "hands_on"
      t.text :instructions, null: false
      t.string :materials, array: true, null: false, default: []
      t.integer :duration_minutes, null: false, default: 10
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :activities, [ :skill_id, :position ]

    create_table :resources do |t|
      t.references :activity, null: false, foreign_key: true
      t.string :kind, null: false
      t.string :url
      t.string :worksheet_template
      t.jsonb :worksheet_params, null: false, default: {}
      t.timestamps
    end

    create_table :children do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.date :date_of_birth, null: false
      t.string :framing, null: false, default: "coverage"
      t.date :target_school_start_on
      t.timestamps
    end

    create_table :child_domains do |t|
      t.references :child, null: false, foreign_key: true
      t.references :domain, null: false, foreign_key: true
      t.boolean :active, null: false, default: true
      t.timestamps
    end
    add_index :child_domains, [ :child_id, :domain_id ], unique: true

    create_table :skill_progress do |t|
      t.references :child, null: false, foreign_key: true
      t.references :skill, null: false, foreign_key: true
      t.string :state, null: false, default: "not_started"
      t.datetime :introduced_at
      t.datetime :mastered_at
      t.integer :attempts_count, null: false, default: 0
      t.timestamps
    end
    add_index :skill_progress, [ :child_id, :skill_id ], unique: true
    add_index :skill_progress, [ :child_id, :state ]

    create_table :plan_items do |t|
      t.references :child, null: false, foreign_key: true
      t.date :scheduled_on, null: false
      t.references :skill, null: false, foreign_key: true
      t.references :activity, null: false, foreign_key: true
      t.string :state, null: false, default: "pending"
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :plan_items, [ :child_id, :scheduled_on, :position ], unique: true

    create_table :log_entries do |t|
      t.references :child, null: false, foreign_key: true
      t.references :plan_item, foreign_key: true
      t.references :skill, null: false, foreign_key: true
      t.string :outcome, null: false
      t.integer :minutes
      t.text :note
      t.date :logged_on, null: false
      t.timestamps
    end
    add_index :log_entries, [ :child_id, :logged_on ]

    create_table :portfolio_items do |t|
      t.references :child, null: false, foreign_key: true
      t.references :skill, foreign_key: true
      t.string :caption
      t.date :taken_on, null: false
      t.timestamps
    end
    add_index :portfolio_items, [ :child_id, :taken_on ]

    create_table :terms do |t|
      t.references :child, null: false, foreign_key: true
      t.string :name, null: false
      t.date :starts_on, null: false
      t.date :ends_on, null: false
      t.timestamps
    end
  end
end
