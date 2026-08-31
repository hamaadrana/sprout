class ChildDomain < ApplicationRecord
  belongs_to :child
  belongs_to :domain

  validates :domain_id, uniqueness: { scope: :child_id }
end
