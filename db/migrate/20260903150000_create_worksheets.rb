class CreateWorksheets < ActiveRecord::Migration[8.1]
  def change
    # The printable-sheet catalog. Each row is one parameterised sheet,
    # keyed by a stable code and optionally linked to a skill so progress
    # states can filter the catalog.
    create_table :worksheets do |t|
      t.string :code, null: false
      t.string :title, null: false
      t.string :template, null: false
      t.jsonb :params, null: false, default: {}
      t.string :domain_code, null: false
      t.string :skill_code
      t.integer :level, null: false, default: 1
      t.integer :position, null: false, default: 0
      t.timestamps
    end
    add_index :worksheets, :code, unique: true
    add_index :worksheets, [ :domain_code, :position ]
    add_index :worksheets, :skill_code
  end
end
