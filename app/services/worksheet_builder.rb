# Turns a worksheet resource (template + params) into the data its ERB
# template renders. All randomness flows from the given seed.
class WorksheetBuilder
  OBJECTS = %w[star heart ball leaf fish].freeze

  def self.build(template:, params:, seed:)
    rng = Random.new(seed)

    case template
    when "numeral_tracing"
      numerals = params.fetch("numerals", [ 1, 2, 3, 4, 5 ])
      {
        template: "numeral_tracing",
        rows: numerals.map do |numeral|
          { numeral: numeral, repetitions: params.fetch("repetitions", 4) }
        end,
        guide_style: params.fetch("guide_style", "dashed")
      }
    when "count_and_write"
      max = params.fetch("max_count", 10)
      item_count = params.fetch("item_count", 6)
      {
        template: "count_and_write",
        items: Array.new(item_count) do
          {
            object: OBJECTS[rng.rand(OBJECTS.length)],
            count: 1 + rng.rand(max)
          }
        end
      }
    when "count_and_circle"
      target = params.fetch("target_number", 5)
      distractor_range = params.fetch("distractor_range", 4)
      {
        template: "count_and_circle",
        target: target,
        rows: Array.new(4) do
          {
            object: OBJECTS[rng.rand(OBJECTS.length)],
            count: target + 1 + rng.rand(distractor_range)
          }
        end
      }
    when "ten_frame"
      {
        template: "ten_frame",
        numbers: params.fetch("numbers", [ 3, 5, 7 ])
      }
    when "match_quantity_numeral"
      low, high = params.fetch("number_range", [ 1, 10 ])
      pair_count = params.fetch("pair_count", 5)
      numbers = (low..high).to_a.shuffle(random: rng).first(pair_count)
      {
        template: "match_quantity_numeral",
        left: numbers.map { |n| { object: OBJECTS[rng.rand(OBJECTS.length)], count: n } },
        right: numbers.shuffle(random: rng)
      }
    when "more_or_less"
      pair_count = params.fetch("pair_count", 5)
      max = params.fetch("max_quantity", 5)
      {
        template: "more_or_less",
        pairs: Array.new(pair_count) do
          a = 1 + rng.rand(max)
          b = 1 + rng.rand(max)
          b = (b % max) + 1 if b == a # never a tie
          object = OBJECTS[rng.rand(OBJECTS.length)]
          { object: object, left: a, right: b }
        end
      }
    when "pattern_completion"
      type = params.fetch("pattern_type", "AB")
      length = params.fetch("length", 8)
      {
        template: "pattern_completion",
        rows: Array.new(3) { pattern_row(type, length, rng) }
      }
    when "shape_tracing"
      {
        template: "shape_tracing",
        shapes: params.fetch("shapes", [ "circle", "square", "triangle" ])
      }
    when "size_ordering"
      item_count = params.fetch("item_count", 4)
      sizes = Array.new(item_count) { |i| 10 + i * 7 }.shuffle(random: rng)
      {
        template: "size_ordering",
        shape: params.fetch("shape", "circle"),
        sizes_mm: sizes
      }
    else
      raise ArgumentError, "Unknown worksheet template: #{template}"
    end
  end

  PATTERN_SHAPES = %w[circle square triangle].freeze

  def self.pattern_row(type, length, rng)
    unit = case type
    when "AAB" then [ 0, 0, 1 ]
    when "ABC" then [ 0, 1, 2 ]
    else [ 0, 1 ]
    end
    shapes = PATTERN_SHAPES.shuffle(random: rng)
    sequence = unit.cycle.first(length).map { |i| shapes[i] }
    { sequence: sequence, blanks: 2 }
  end
end
