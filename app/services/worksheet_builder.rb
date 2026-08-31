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
    else
      raise ArgumentError, "Unknown worksheet template: #{template}"
    end
  end
end
