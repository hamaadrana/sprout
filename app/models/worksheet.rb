class Worksheet < ApplicationRecord
  TEMPLATES = %w[
    numeral_tracing letter_tracing word_tracing count_and_write
    count_and_circle ten_frame match_quantity_numeral more_or_less
    pattern_completion shape_tracing size_ordering letter_case_match
    colour_by_shape
  ].freeze

  validates :code, presence: true, uniqueness: true
  validates :title, presence: true
  validates :template, inclusion: { in: TEMPLATES }
  validates :level, inclusion: { in: 1..3 }

  def skill
    @skill ||= skill_code && Skill.find_by(code: skill_code)
  end
end
