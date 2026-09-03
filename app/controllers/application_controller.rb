class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  before_action :authenticate_user!, unless: :devise_controller?

  # inertia_share registers its own before_action, so it must be declared
  # before any before_action that might render-and-halt the chain (like
  # enforce_billing) — otherwise a halted request never gets shared props
  # and the Inertia page renders with app_name/auth/child all missing.
  inertia_share do
    {
      app_name: Rails.configuration.x.app_name,
      tagline: Rails.configuration.x.app_tagline,
      auth: current_user && { name: current_user.name, email: current_user.email, admin: current_user.admin? },
      child: current_child && {
        id: current_child.id,
        name: current_child.name,
        age_label: current_child.age_label,
        framing: current_child.framing,
        gender: current_child.gender,
        pronouns: current_child.pronouns,
        personality: current_child.traits["personality"],
        months_to_school: months_to_school
      }
    }
  end

  before_action :enforce_billing, unless: :devise_controller?
  layout :layout_by_context
  before_action :configure_permitted_parameters, if: :devise_controller?
  around_action :use_user_time_zone, if: :user_signed_in?

  private

  # Full-page, non-dismissable paywall for any signed-in, non-admin user
  # whose trial has ended and who hasn't been marked paid. Renders instead
  # of the requested page (not a redirect, so there's no other route to
  # reach) on EVERY action in the app except sign-in/out and the
  # superadmin panel itself.
  def enforce_billing
    return unless user_signed_in?
    return if current_user.access_active?

    render inertia: "Billing/Locked", props: {
      whatsapp_number: Rails.configuration.x.whatsapp_number,
      nayapay_number: Rails.configuration.x.nayapay_number,
      monthly_price: User::MONTHLY_PRICE_PKR
    }
  end

  # Adapts she/her-authored content text to the current child's pronouns.
  def adapt(text)
    Pronouns.adapt(text, current_child&.gender)
  end

  def months_to_school
    date = current_child&.target_school_start_on
    return nil if date.blank?
    [ (date.year * 12 + date.month) - (Date.current.year * 12 + Date.current.month), 0 ].max
  end

  def layout_by_context
    devise_controller? ? "auth" : "application"
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :name ])
    devise_parameter_sanitizer.permit(:account_update, keys: [ :name, :city, :timezone ])
  end

  def current_child
    return nil unless user_signed_in?
    @current_child ||= current_user.children.first
  end
  helper_method :current_child

  def require_child!
    redirect_to onboarding_path if current_child.nil?
  end

  def use_user_time_zone(&block)
    Time.use_zone(current_user.timezone, &block)
  end
end
