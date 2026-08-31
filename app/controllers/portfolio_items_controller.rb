class PortfolioItemsController < ApplicationController
  before_action :require_child!

  THUMB = { resize_to_limit: [ 400, 400 ] }.freeze

  def index
    items = current_child.portfolio_items.with_attached_image
                         .includes(:skill).order(taken_on: :desc, id: :desc)

    months = items.group_by { |i| i.taken_on.beginning_of_month }.map do |month, month_items|
      {
        label: month.strftime("%B %Y"),
        items: month_items.map { |item| item_props(item) }
      }
    end

    skills = current_child.active_domains.flat_map do |domain|
      domain.skills.order(:position).map { |s| { id: s.id, title: s.title } }
    end

    render inertia: "Portfolio/Index", props: { months: months, skills: skills }
  end

  def create
    item = current_child.portfolio_items.build(
      caption: params[:caption].presence,
      skill_id: params[:skill_id].presence,
      taken_on: params[:taken_on].presence || Date.current
    )

    if params[:image].blank?
      return redirect_to portfolio_items_path, inertia: { errors: { image: [ "Choose a photo first" ] } }
    end

    ActiveRecord::Base.transaction do
      item.save!
      PortfolioPhoto.attach(item, params[:image])
    end

    redirect_to portfolio_items_path
  rescue PortfolioPhoto::NotAnImage => e
    redirect_to portfolio_items_path, inertia: { errors: { image: [ e.message ] } }
  end

  def destroy
    current_child.portfolio_items.find(params[:id]).destroy!
    redirect_to portfolio_items_path
  end

  private

  def item_props(item)
    {
      id: item.id,
      caption: item.caption,
      taken_on: item.taken_on.iso8601,
      skill_title: item.skill&.title,
      thumb_url: item.image.attached? ? rails_representation_path(item.image.variant(THUMB), only_path: true) : nil,
      full_url: item.image.attached? ? rails_blob_path(item.image, disposition: "inline", only_path: true) : nil
    }
  end
end
