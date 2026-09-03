require "rails_helper"

RSpec.describe "Child settings", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:user) { User.create!(email: "parent@example.com", password: "password123") }
  let!(:child) do
    Child.create!(
      user: user, name: "Ayesha", date_of_birth: 4.years.ago.to_date,
      gender: "girl", framing: "readiness",
      target_school_start_on: Date.new(2027, 4, 1),
      traits: { "personality" => "thinker", "loves" => "stickers" },
      goals: %w[counting]
    )
  end

  before { sign_in user }

  it "renders the settings page with the child's current details" do
    get settings_path
    expect(response).to have_http_status(:ok)
    expect(response.body).to include("Settings")
    expect(response.body).to include("Ayesha")
  end

  it "updates the child's details" do
    patch child_path, params: {
      child: {
        name: "Ayesha Khan", gender: "girl", framing: "readiness",
        date_of_birth: child.date_of_birth.iso8601,
        target_school_start_on: "2027-08-01",
        traits: { personality: "explorer", loves: "" },
        goals: [ "reading", "confidence" ]
      }
    }

    expect(response).to redirect_to(settings_path)
    child.reload
    expect(child.name).to eq("Ayesha Khan")
    expect(child.traits).to eq({ "personality" => "explorer" }) # blank loves cleared
    expect(child.goals).to eq(%w[reading confidence])
    expect(child.target_school_start_on).to eq(Date.new(2027, 8, 1))
  end

  it "clears the school date when switching to coverage framing" do
    patch child_path, params: {
      child: { name: "Ayesha", framing: "coverage", date_of_birth: child.date_of_birth.iso8601 }
    }
    expect(child.reload.framing).to eq("coverage")
    expect(child.target_school_start_on).to be_nil
  end

  it "rejects invalid updates with errors" do
    patch child_path, params: { child: { name: "", date_of_birth: child.date_of_birth.iso8601 } }
    expect(response).to redirect_to(settings_path)
    expect(child.reload.name).to eq("Ayesha")
  end
end
