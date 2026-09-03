module Superadmin
  class UsersController < BaseController
    def index
      users = User.left_joins(children: :log_entries)
                  .select("users.*, max(log_entries.logged_on) AS last_active_on")
                  .group("users.id")
                  .order(created_at: :desc)

      render inertia: "Superadmin/Users/Index", props: {
        users: users.map { |u| user_row(u) },
        monthly_price: User::MONTHLY_PRICE_PKR
      }
    end

    def lock
      user = User.find(params[:id])
      user.update!(locked_by_admin: true)
      redirect_to superadmin_users_path
    end

    def unlock
      user = User.find(params[:id])
      user.update!(locked_by_admin: false)
      redirect_to superadmin_users_path
    end

    def mark_paid
      user = User.find(params[:id])
      user.grant_access!(months: (params[:months] || 1).to_i)
      redirect_to superadmin_users_path
    end

    private

    def user_row(user)
      child = user.children.first
      {
        id: user.id,
        name: user.name,
        email: user.email,
        admin: user.admin?,
        signed_up_on: user.created_at.to_date.iso8601,
        last_active_on: user.try(:last_active_on)&.iso8601,
        child_name: child&.name,
        child_age_label: child&.age_label,
        framing: child&.framing,
        access_status: user.access_status,
        trial_ends_at: user.trial_ends_at&.iso8601,
        access_granted_until: user.access_granted_until&.iso8601,
        locked_by_admin: user.locked_by_admin?
      }
    end
  end
end
