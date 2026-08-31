class HomeController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    return redirect_to today_path if user_signed_in?

    render inertia: "Landing"
  end
end
