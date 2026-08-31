class Resource < ApplicationRecord
  belongs_to :activity

  enum :kind, {
    generated_worksheet: "generated_worksheet",
    external_link: "external_link",
    attachment: "attachment"
  }, validate: true

  validates :url, presence: true, if: :external_link?
  validates :worksheet_template, presence: true, if: :generated_worksheet?
end
