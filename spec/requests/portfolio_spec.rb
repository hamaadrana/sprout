require "rails_helper"

RSpec.describe "Portfolio", type: :request do
  include Devise::Test::IntegrationHelpers
  include ActiveSupport::Testing::TimeHelpers

  let(:user) { User.create!(email: "p@example.com", password: "password123") }
  let!(:child) { Child.create!(user: user, name: "Ayesha", date_of_birth: 4.years.ago.to_date) }

  before { sign_in user }

  def upload(name, type)
    fixture_file_upload(name, type)
  end

  describe "create" do
    it "stores a downsized WebP, never the original" do
      post portfolio_items_path, params: {
        image: upload("big_photo.jpg", "image/jpeg"),
        caption: "First tracing sheet"
      }
      expect(response).to redirect_to(portfolio_items_path)

      item = child.portfolio_items.sole
      expect(item.caption).to eq("First tracing sheet")
      expect(item.image).to be_attached
      expect(item.image.blob.content_type).to eq("image/webp")

      item.image.blob.analyze
      expect(item.image.blob.metadata[:width]).to be <= 1600
      expect(item.image.blob.metadata[:height]).to be <= 1600
      # The 2400px original must not be what we stored.
      expect(item.image.blob.byte_size).to be < File.size(file_fixture("big_photo.jpg"))
    end

    it "keeps small images small and tags a skill" do
      domain = Domain.create!(code: "NUM", name: "Numeracy", position: 1)
      skill = Skill.create!(domain: domain, code: "NUM.01.x", position: 1, title: "Counting",
                            mastery_descriptor: "d", age_min_months: 36, age_max_months: 72)

      post portfolio_items_path, params: {
        image: upload("tiny.png", "image/png"), skill_id: skill.id
      }

      expect(child.portfolio_items.sole.skill).to eq(skill)
    end

    it "rejects non-image files" do
      post portfolio_items_path, params: { image: upload("note.txt", "text/plain") }
      expect(child.portfolio_items.count).to eq(0)
    end

    it "rejects a missing file" do
      post portfolio_items_path, params: { caption: "no photo" }
      expect(child.portfolio_items.count).to eq(0)
    end
  end

  describe "index" do
    it "groups items by month, newest first" do
      travel_to Date.new(2026, 7, 10) do
        post portfolio_items_path, params: { image: upload("tiny.png", "image/png") }
      end
      travel_to Date.new(2026, 8, 20) do
        post portfolio_items_path, params: { image: upload("tiny.png", "image/png") }
      end

      get portfolio_items_path
      expect(response).to have_http_status(:ok)
      expect(response.body.index("August 2026")).to be < response.body.index("July 2026")
    end
  end

  describe "destroy" do
    it "removes the item" do
      post portfolio_items_path, params: { image: upload("tiny.png", "image/png") }
      item = child.portfolio_items.sole

      delete portfolio_item_path(item)
      expect(child.portfolio_items.count).to eq(0)
    end

    it "cannot remove another family's item" do
      stranger = User.create!(email: "o@example.com", password: "password123")
      other_child = Child.create!(user: stranger, name: "X", date_of_birth: 4.years.ago.to_date)
      item = other_child.portfolio_items.create!(taken_on: Date.current)

      delete portfolio_item_path(item)
      expect(response).to have_http_status(:not_found)
      expect(other_child.portfolio_items.count).to eq(1)
    end
  end
end
