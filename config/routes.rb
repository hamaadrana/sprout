Rails.application.routes.draw do
  devise_for :users

  root "today#show"
  get "today", to: "today#show"

  resource :child, only: [ :new, :create ]
  post "plan_items/:plan_item_id/log", to: "logs#create", as: :plan_item_log
  patch "plan_items/:id/swap", to: "plan_items#swap", as: :plan_item_swap
  get "plan_items/:plan_item_id/worksheet", to: "worksheets#show", as: :plan_item_worksheet

  resources :skills, only: [ :index ] do
    post :master, on: :member
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
