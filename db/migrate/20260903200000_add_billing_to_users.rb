class AddBillingToUsers < ActiveRecord::Migration[8.1]
  def up
    add_column :users, :admin, :boolean, null: false, default: false
    add_column :users, :trial_ends_at, :datetime
    add_column :users, :access_granted_until, :datetime
    add_column :users, :locked_by_admin, :boolean, null: false, default: false

    # Give everyone who already signed up a fresh 3-day trial starting now,
    # rather than backdating from their original signup (which would lock
    # existing testers out immediately on deploy).
    execute "UPDATE users SET trial_ends_at = NOW() + INTERVAL '3 days' WHERE trial_ends_at IS NULL"
  end

  def down
    remove_column :users, :admin
    remove_column :users, :trial_ends_at
    remove_column :users, :access_granted_until
    remove_column :users, :locked_by_admin
  end
end
