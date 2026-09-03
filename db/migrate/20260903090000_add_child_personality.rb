class AddChildPersonality < ActiveRecord::Migration[8.1]
  def change
    add_column :children, :gender, :string            # girl | boy (nil = unspecified)
    add_column :children, :traits, :jsonb, null: false, default: {}   # personality, loves
    add_column :children, :goals, :string, array: true, null: false, default: []
    add_column :children, :head_start_codes, :string, array: true, null: false, default: []
  end
end
