require "rails_helper"

RSpec.describe User do
  def build_user(**attrs)
    User.create!(email: "#{SecureRandom.hex(4)}@example.com", password: "password123", **attrs)
  end

  it "starts a 3-day trial automatically on creation" do
    user = build_user
    expect(user.trial_ends_at).to be_within(5.seconds).of(3.days.from_now)
    expect(user.access_status).to eq(:trial)
    expect(user).to be_access_active
  end

  it "does not overwrite an explicitly set trial_ends_at" do
    custom = 10.days.from_now
    user = build_user(trial_ends_at: custom)
    expect(user.trial_ends_at).to be_within(1.second).of(custom)
  end

  it "is expired once the trial passes with no payment" do
    user = build_user(trial_ends_at: 1.hour.ago)
    expect(user.access_status).to eq(:expired)
    expect(user).not_to be_access_active
  end

  it "is paid while access_granted_until is in the future" do
    user = build_user(trial_ends_at: 1.hour.ago, access_granted_until: 2.weeks.from_now)
    expect(user.access_status).to eq(:paid)
    expect(user).to be_access_active
  end

  it "locked_by_admin overrides an active trial or payment" do
    user = build_user(access_granted_until: 2.weeks.from_now, locked_by_admin: true)
    expect(user.access_status).to eq(:locked)
    expect(user).not_to be_access_active
  end

  it "admin bypasses everything, even an explicit lock" do
    user = build_user(admin: true, locked_by_admin: true, trial_ends_at: 1.hour.ago)
    expect(user.access_status).to eq(:admin)
    expect(user).to be_access_active
  end

  describe "#grant_access!" do
    it "extends a month from now when there is no prior grant" do
      user = build_user(trial_ends_at: 1.hour.ago, locked_by_admin: true)
      user.grant_access!
      expect(user.access_granted_until).to be_within(5.seconds).of(1.month.from_now)
      expect(user).not_to be_locked_by_admin
      expect(user.access_status).to eq(:paid)
    end

    it "stacks on top of an existing future grant instead of resetting it" do
      existing = 3.weeks.from_now
      user = build_user(access_granted_until: existing)
      user.grant_access!(months: 1)
      expect(user.access_granted_until).to be_within(5.seconds).of(existing + 1.month)
    end
  end

  describe "#trial_days_left" do
    it "counts up, never negative" do
      user = build_user(trial_ends_at: 25.hours.from_now)
      expect(user.trial_days_left).to eq(2)
      user.update!(trial_ends_at: 1.hour.ago)
      expect(user.trial_days_left).to eq(0)
    end
  end
end
