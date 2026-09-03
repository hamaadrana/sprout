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
    "holds_pencil" => %w[LIT.D01.pencil_grip],
    "knows_colours" => %w[ART.A01.first_colours],
    "knows_body_parts" => %w[WLD.A01.body_parts],
    "dresses_self" => %w[GRW.A03.dress_myself],
    "uses_scissors" => %w[MOV.B02.tear_fold_paste MOV.B03.scissor_skills],
    "says_name_age" => %w[GRW.A01.who_am_i]
  }.freeze

  def new
    redirect_to today_path if current_child.present?
    render inertia: "Onboarding"
  end

  def edit
    return redirect_to onboarding_path if current_child.nil?

    render inertia: "Settings", props: {
      child_form: {
        name: current_child.name,
        date_of_birth: current_child.date_of_birth.iso8601,
        gender: current_child.gender,
        framing: current_child.framing,
        target_school_start_on: current_child.target_school_start_on&.iso8601,
        personality: current_child.traits["personality"],
        loves: current_child.traits["loves"],
        goals: current_child.goals
      }
    }
  end

  def update
    return redirect_to onboarding_path if current_child.nil?

    attrs = params.require(:child).permit(
      :name, :date_of_birth, :gender, :framing, :target_school_start_on,
      traits: [ :personality, :loves ], goals: []
    )
    attrs[:goals] = Array(attrs[:goals]).reject(&:blank?) if attrs.key?(:goals)
    incoming_traits = (attrs[:traits] || {}).to_h.transform_values(&:presence)
    attrs[:traits] = current_child.traits.merge(incoming_traits).compact
    attrs[:target_school_start_on] = nil if attrs[:framing] == "coverage"
    current_child.update!(attrs)

    redirect_to settings_path
  rescue ActiveRecord::RecordInvalid
    redirect_to settings_path, inertia: { errors: current_child.errors.to_hash(true) }
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
