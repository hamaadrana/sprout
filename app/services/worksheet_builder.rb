# Turns a worksheet resource (template + params) into the data its ERB
# template renders. All randomness flows from the given seed.
#
# Accepts both parameter spellings — the curriculum YAML's short names
# (max, rows, range, pairs, count, types) and the original long names.
class WorksheetBuilder
  OBJECTS = %w[star heart ball leaf fish].freeze
  PATTERN_SHAPES = %w[circle square triangle].freeze
  GUIDE_STYLES = { "dotted" => "dashed", "grey" => "faint", "gray" => "faint" }.freeze

  def self.build(template:, params:, seed:)
    rng = Random.new(seed)

    case template
    when "numeral_tracing"
      numerals = params.fetch("numerals", [ 1, 2, 3, 4, 5 ])
      style = params.fetch("guide_style", "dashed")
      {
        template: "numeral_tracing",
        rows: numerals.map do |numeral|
          { numeral: numeral, repetitions: params.fetch("repetitions", 4) }
        end,
        guide_style: GUIDE_STYLES.fetch(style, style)
      }
    when "letter_tracing"
      letters = params.fetch("letters", %w[a b c])
      style = params.fetch("guide_style", "dashed")
      {
        template: "numeral_tracing", # same row-of-glyphs rendering
        rows: letters.map do |letter|
          { numeral: letter, repetitions: params.fetch("repetitions", 4) }
        end,
        guide_style: GUIDE_STYLES.fetch(style, style)
      }
    when "letter_case_match"
      pair_count = params["pairs"] || params["pair_count"] || 6
      letters = ("a".."z").to_a.shuffle(random: rng).first(pair_count)
      {
        template: "letter_case_match",
        left: letters.map(&:upcase),
        right: letters.shuffle(random: rng)
      }
    when "word_tracing"
      words =
        if params["use_name"] && params["child_name"].present?
          [ params["child_name"] ]
        else
          params.fetch("words", %w[cat sun mat])
        end
      {
        template: "word_tracing",
        rows: words.map { |w| { word: w, repetitions: params.fetch("repetitions", 3) } }
      }
    when "colour_by_shape"
      shapes = params.fetch("shapes", %w[circle square triangle])
      colours = params.fetch("colours", %w[red blue yellow])
      grid_count = params.fetch("grid_count", 15)
      {
        template: "colour_by_shape",
        legend: shapes.each_with_index.map { |s, i| { shape: s, colour: colours[i % colours.length] } },
        grid: Array.new(grid_count) { shapes[rng.rand(shapes.length)] }
      }
    when "count_and_write"
      max = params["max_count"] || params["max"] || 10
      if params["mode"] == "missing_number"
        rows = params["rows"] || 5
        {
          template: "count_and_write",
          mode: "missing_number",
          lines: Array.new(rows) do
            gaps = (1..max).to_a.sample(2, random: rng)
            { numbers: (1..max).map { |n| gaps.include?(n) ? nil : n } }
          end
        }
      else
        item_count = params["item_count"] || (params["rows"] ? params["rows"] * 2 : 6)
        {
          template: "count_and_write",
          mode: "count",
          items: Array.new(item_count) do
            {
              object: OBJECTS[rng.rand(OBJECTS.length)],
              count: 1 + rng.rand(max)
            }
          end
        }
      end
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
      low, high = params["number_range"] || params["range"] || [ 1, 10 ]
      pair_count = params["pair_count"] || params["pairs"] || 5
      numbers = (low..high).to_a.shuffle(random: rng).first(pair_count)
      {
        template: "match_quantity_numeral",
        left: numbers.map { |n| { object: OBJECTS[rng.rand(OBJECTS.length)], count: n } },
        right: numbers.shuffle(random: rng)
      }
    when "more_or_less"
      pair_count = params["pair_count"] || params["pairs"] || 5
      max = params["max_quantity"] || params["max"] || 5
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
      types = params["types"] || [ params["pattern_type"] || "AB" ] * 3
      length = params.fetch("length", 8)
      {
        template: "pattern_completion",
        rows: types.map { |type| pattern_row(type, length, rng) }
      }
    when "shape_tracing"
      {
        template: "shape_tracing",
        shapes: params.fetch("shapes", [ "circle", "square", "triangle" ])
      }
    when "size_ordering"
      item_count = params["item_count"] || params["count"] || 4
      sizes = Array.new(item_count) { |i| 10 + i * 6 }.shuffle(random: rng)
      {
        template: "size_ordering",
        shape: params.fetch("shape", "circle"),
        sizes_mm: sizes
      }
    else
      raise ArgumentError, "Unknown worksheet template: #{template}"
    end
  end

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
