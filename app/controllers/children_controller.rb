class ChildrenController < ApplicationController
  def new
    redirect_to root_path if current_child.present?
    render inertia: "Children/New"
  end

  def create
    child = current_user.children.build(child_params)

    ActiveRecord::Base.transaction do
      child.save!
      # v1 starts every child on every domain; there is only numeracy today.
      Domain.find_each { |domain| child.child_domains.create!(domain: domain) }
    end

    redirect_to root_path
  rescue ActiveRecord::RecordInvalid
    redirect_to new_child_path, inertia: { errors: child.errors.to_hash(true) }
  end

  private

  def child_params
    params.require(:child).permit(:name, :date_of_birth)
  end
end
