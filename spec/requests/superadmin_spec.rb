require "rails_helper"

RSpec.describe "Superadmin", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:admin) { User.create!(email: "admin@example.com", password: "password123", admin: true) }
  let(:parent) { User.create!(email: "parent@example.com", password: "password123", name: "A Parent") }

  describe "authorization" do
    it "404s for a signed-in non-admin" do
      sign_in parent
      get superadmin_users_path
      expect(response).to have_http_status(:not_found)
    end

    it "404s the mutation endpoints for a non-admin too" do
      sign_in parent
      other = User.create!(email: "x@example.com", password: "password123")
      post lock_superadmin_user_path(other)
      expect(response).to have_http_status(:not_found)
      expect(other.reload).not_to be_locked_by_admin
    end

    it "redirects a signed-out visitor to sign in" do
      get superadmin_users_path
      expect(response).to redirect_to(new_user_session_path)
    end

    it "renders the index for an admin" do
      sign_in admin
      get superadmin_users_path
      expect(response).to have_http_status(:ok)
      expect(response.body).to include("Superadmin/Users/Index")
    end
  end

  describe "user list" do
    it "includes every signed-up user with their child and status" do
      Child.create!(user: parent, name: "Zara", date_of_birth: 4.years.ago.to_date)
      sign_in admin
      get superadmin_users_path
      expect(response.body).to include("parent@example.com")
      expect(response.body).to include("Zara")
    end
  end

  describe "lock / unlock / mark_paid" do
    before { sign_in admin }

    it "locks and unlocks an account" do
      post lock_superadmin_user_path(parent)
      expect(parent.reload).to be_locked_by_admin

      post unlock_superadmin_user_path(parent)
      expect(parent.reload).not_to be_locked_by_admin
    end

    it "marks a user paid, extends access, and clears any lock" do
      parent.update!(locked_by_admin: true, trial_ends_at: 1.hour.ago)
      post mark_paid_superadmin_user_path(parent), params: { months: 2 }

      parent.reload
      expect(parent).not_to be_locked_by_admin
      expect(parent.access_granted_until).to be_within(1.minute).of(2.months.from_now)
      expect(parent.access_status).to eq(:paid)
    end
  end
end
