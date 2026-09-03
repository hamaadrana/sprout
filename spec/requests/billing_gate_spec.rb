require "rails_helper"

RSpec.describe "Billing gate", type: :request do
  include Devise::Test::IntegrationHelpers

  def user_with(**attrs)
    User.create!(email: "#{SecureRandom.hex(4)}@example.com", password: "password123", **attrs)
  end

  it "lets a trial user reach the app (onboarding, since there's no child yet)" do
    user = user_with
    sign_in user
    get today_path
    expect(response).to have_http_status(:redirect)
    expect(response).to redirect_to(onboarding_path)
  end

  it "shows the non-dismissable paywall instead of the page once the trial ends" do
    user = user_with(trial_ends_at: 1.hour.ago)
    sign_in user
    get today_path
    expect(response).to have_http_status(:ok)
    expect(response.body).to include("Billing/Locked")
    expect(response.body).to include("100")
  end

  it "gates every controller, not just one" do
    user = user_with(trial_ends_at: 1.hour.ago)
    sign_in user
    [ skills_path, worksheets_path, "/portfolio", report_path, "/activities" ].each do |path|
      get path
      expect(response.body).to include("Billing/Locked"), "#{path} did not show the paywall"
    end
  end

  it "an admin is never gated, even when explicitly locked" do
    user = user_with(admin: true, locked_by_admin: true, trial_ends_at: 1.hour.ago)
    sign_in user
    get today_path
    expect(response.body).not_to include("Billing/Locked")
  end

  it "a manually locked user is gated regardless of trial or payment" do
    user = user_with(access_granted_until: 1.month.from_now, locked_by_admin: true)
    sign_in user
    get today_path
    expect(response.body).to include("Billing/Locked")
  end

  it "still shares app_name/auth on the locked page (inertia_share must run before enforce_billing halts)" do
    user = user_with(trial_ends_at: 1.hour.ago, name: "Regression Parent")
    sign_in user
    get today_path
    props = CGI.unescapeHTML(response.body)
    expect(props).to include('"app_name":"Sprout"')
    expect(props).to include("Regression Parent")
  end

  it "does not gate the sign-in/sign-out flow itself" do
    user = user_with(trial_ends_at: 1.hour.ago)
    get new_user_session_path
    expect(response).to have_http_status(:ok)
    expect(response.body).not_to include("Billing/Locked")
  end
end
