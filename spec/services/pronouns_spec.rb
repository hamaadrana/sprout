require "rails_helper"

RSpec.describe Pronouns do
  it "leaves text alone for girls and unspecified" do
    expect(Pronouns.adapt("Ask her to count.", "girl")).to eq("Ask her to count.")
    expect(Pronouns.adapt("Ask her to count.", nil)).to eq("Ask her to count.")
  end

  it "converts subject, reflexive and standalone forms" do
    expect(Pronouns.adapt("She counts by herself. The turn is hers.", "boy"))
      .to eq("He counts by himself. The turn is his.")
  end

  it "distinguishes object from possessive her" do
    expect(Pronouns.adapt("Ask her to trace her name with her own pencil.", "boy"))
      .to eq("Ask him to trace his name with his own pencil.")
    expect(Pronouns.adapt("Count with her.", "boy")).to eq("Count with him.")
    expect(Pronouns.adapt("Let her cut along her line.", "boy"))
      .to eq("Let him cut along his line.")
    expect(Pronouns.adapt("Give her her own small portion.", "boy"))
      .to eq("Give him his own small portion.")
  end

  it "does not touch unrelated words" do
    expect(Pronouns.adapt("Gather the shells here.", "boy")).to eq("Gather the shells here.")
  end
end
