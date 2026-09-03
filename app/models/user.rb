class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :children, dependent: :destroy

  before_create :start_trial

  MONTHLY_PRICE_PKR = 100

  # :admin    — bypasses billing entirely
  # :locked   — an admin has manually blocked this account, regardless of
  #             trial or payment state
  # :trial    — inside the free 3-day window
  # :paid     — access_granted_until is in the future (admin marked paid)
  # :expired  — none of the above; the paywall shows
  def access_status
    return :admin if admin?
    return :locked if locked_by_admin?
    return :trial if trial_ends_at && trial_ends_at.future?
    return :paid if access_granted_until && access_granted_until.future?
    :expired
  end

  def access_active?
    %i[admin trial paid].include?(access_status)
  end

  def trial_days_left
    return 0 unless trial_ends_at
    [ ((trial_ends_at - Time.current) / 1.day).ceil, 0 ].max
  end

  # Records a payment confirmed manually by the admin (after checking the
  # WhatsApp screenshot) and lifts any manual lock.
  def grant_access!(months: 1)
    base = [ access_granted_until, Time.current ].compact.max
    update!(access_granted_until: base + months.months, locked_by_admin: false)
  end

  private

  def start_trial
    self.trial_ends_at ||= 3.days.from_now
  end
end
