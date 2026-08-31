Rails.application.routes.draw do
  devise_for :users

  root "today#show"
  get "today", to: "today#show"

  resource :child, only: [ :new, :create ]
  post "plan_items/:plan_item_id/log", to: "logs#create", as: :plan_item_log

  get "up" => "rails/health#show", as: :rails_health_check
end
