class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  before_action :authenticate_user!, unless: :devise_controller?
  layout :layout_by_context
  before_action :configure_permitted_parameters, if: :devise_controller?
  around_action :use_user_time_zone, if: :user_signed_in?

  inertia_share do
    {
      auth: current_user && { name: current_user.name, email: current_user.email },
      child: current_child && {
        id: current_child.id,
        name: current_child.name,
        age_label: current_child.age_label,
        framing: current_child.framing
      }
    }
  end

  private

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
