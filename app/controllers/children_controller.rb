class ChildrenController < ApplicationController
  # "What can your child already do?" onboarding answers → skills marked
  # mastered from day one, so the plan starts at the right place.
  HEAD_START = {
    "counts_to_10" => %w[NUM.B01.rote_count_5 NUM.B02.rote_count_10],
    "counts_objects" => %w[NUM.B03.one_to_one_5],
    "knows_numbers_to_5" => %w[NUM.B06.numeral_recognition_5],
    "knows_shapes" => %w[NUM.D01.name_2d_shapes],
    "sings_rhymes" => %w[LIT.A02.rhymes_and_songs],
    "full_sentences" => %w[LIT.A03.speaks_in_sentences],
    "knows_some_letters" => %w[LIT.C03.name_letters],
    "knows_most_letters" => %w[LIT.C03.name_letters LIT.C04.knows_letters],
    "holds_pencil" => %w[LIT.D01.pencil_grip]
  }.freeze

  def new
    redirect_to today_path if current_child.present?
    render inertia: "Onboarding"
  end

  def create
    child = current_user.children.build(child_params)
    head_start = Array(params.dig(:child, :head_start)) & HEAD_START.keys
    child.head_start_codes = head_start.flat_map { |key| HEAD_START.fetch(key) }.uniq

    ActiveRecord::Base.transaction do
      child.save!
      # v1 starts every child on every domain.
      Domain.find_each { |domain| child.child_domains.create!(domain: domain) }
      apply_head_start(child)
    end

    redirect_to today_path
  rescue ActiveRecord::RecordInvalid
    redirect_to onboarding_path, inertia: { errors: child.errors.to_hash(true) }
  end

  private

  def apply_head_start(child)
    Skill.where(code: child.head_start_codes).find_each do |skill|
      child.skill_progress.create!(
        skill: skill, state: :mastered,
        introduced_at: Time.current, mastered_at: Time.current
      )
    end
  end

  def child_params
    permitted = params.require(:child).permit(
      :name, :date_of_birth, :gender, :framing, :target_school_start_on,
      traits: [ :personality, :loves ], goals: []
    )
    permitted[:goals] = Array(permitted[:goals]).reject(&:blank?)
    permitted[:traits] = (permitted[:traits] || {}).to_h.compact_blank
    permitted
  end
end
