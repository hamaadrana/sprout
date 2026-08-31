Rails.application.routes.draw do
  devise_for :users

  root "home#index"

  get "today", to: "today#show"
  get "onboarding", to: "children#new"
  resource :child, only: [ :create ]

  get "plan_items/:plan_item_id/log", to: "logs#new", as: :plan_item_log_form
  post "plan_items/:plan_item_id/log", to: "logs#create", as: :plan_item_log
  patch "plan_items/:id/swap", to: "plan_items#swap", as: :plan_item_swap
  get "plan_items/:plan_item_id/worksheet", to: "worksheets#show", as: :plan_item_worksheet

  resources :skills, only: [ :index ] do
    member do
      post :master
      post :teach_next
    end
  end

  get "worksheets", to: "worksheets#index"
  get "worksheets/:skill_id", to: "worksheets#studio", as: :worksheet_studio
  get "worksheets/:skill_id/sheet", to: "worksheets#sheet", as: :sheet_worksheet

  resources :portfolio_items, only: [ :index, :create, :destroy ], path: "portfolio"

  get "report", to: "reports#show"
  get "report/share", to: "reports#share", as: :report_share

  get "activities", to: "extras#index"

  get "up" => "rails/health#show", as: :rails_health_check
end
