class CreateProposalsAndGeneratedProposals < ActiveRecord::Migration[7.1]
  def change
    create_table :proposals do |t|
      t.references :user, null: false, foreign_key: true

      t.string :client_name
      t.text :client_requirements
      t.text :scope_of_work
      t.string :timeline
      t.string :pricing
      t.string :status, default: 'draft', null: false

      # Use user_preferences as the "preference" reference (your app's naming)
      t.references :user_preference, foreign_key: true, null: true

      t.timestamps
    end

    add_index :proposals, :status

    create_table :generated_proposals do |t|
      t.references :proposal, null: false, foreign_key: true

      # Structured sections returned by the AI (formal template)
      t.jsonb :content_sections, default: {}, null: false

      t.string :selected_template
      t.integer :version, default: 1, null: false

      t.timestamps
    end

    add_index :generated_proposals, :content_sections, using: :gin
  end
end
