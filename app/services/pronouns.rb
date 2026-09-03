# Curriculum and library text is authored with she/her. This adapts it for
# boys at render time. For children with no gender set, text is returned as
# authored (UI chrome handles they/them itself, where agreement matters).
#
# "her" is ambiguous: possessive ("her hand" -> "his hand") or object
# ("ask her" -> "ask him"). In this instructional corpus the following word
# decides: function words and clause boundaries mean object position;
# a content word after it means possessive. Causatives ("let her cut")
# take a bare verb next, so the preceding word breaks that tie.
class Pronouns
  FUNCTION_FOLLOWERS = %w[
    to a an the and or but if when while so then at on in into from with
    over out up down again about for by as that this there off along too
    how what why where is was does do her him his
  ].to_set.freeze

  # Causatives take a bare verb after the object ("let her cut");
  # ditransitives take a second object ("give her one", "show her the door").
  # Either way, "her" right after them is object position.
  CAUSATIVES = %w[let lets watch watches help helps make makes made hear
                  hears see sees have has give gives gave show shows teach
                  teaches tell tells told hand hands bring brings ask asks
                  asked send sends offer offers].to_set.freeze

  def self.adapt(text, gender)
    return text if text.blank? || gender != "boy"

    result = text.gsub(/\b(She|she|Hers|hers|Herself|herself)\b/) do |match|
      { "She" => "He", "she" => "he", "Hers" => "His", "hers" => "his",
        "Herself" => "Himself", "herself" => "himself" }[match]
    end

    tokens = result.split(/(\s+)/)
    prev_word = nil
    tokens.each_with_index do |token, i|
      next if token.match?(/\A\s*\z/)
      if token.match?(/\A[Hh]er[.,;:!?"')\]—-]*\z/)
        following = tokens[(i + 1)..]&.find { |t| !t.match?(/\A\s*\z/) }
        following_word = following.to_s.downcase.gsub(/[^a-z]/, "")
        prev = prev_word.to_s.downcase.gsub(/[^a-z]/, "")

        object_position =
          token.match?(/[.,;:!?—]/) ||                     # "count with her." etc.
          following.nil? ||
          (following_word != "own" &&
            (FUNCTION_FOLLOWERS.include?(following_word) || CAUSATIVES.include?(prev)))

        replacement = object_position ? "him" : "his"
        replacement = replacement.capitalize if token.start_with?("H")
        tokens[i] = token.sub(/[Hh]er/, replacement)
      end
      prev_word = token
    end
    tokens.join
  end
end
