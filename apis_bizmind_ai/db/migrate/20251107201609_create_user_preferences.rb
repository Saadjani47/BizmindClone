class CreateUserPreferences < ActiveRecord::Migration[7.1]
  def change
    create_table :user_preferences do |t|
      t.string :theme
      t.string :language

      t.references :user, null: false, foreign_key: true, index: true

      t.string :industry
      t.string :niche
      t.string :template_style # pointer to TemplateStyle or Template
      t.string :tone_of_voice
      t.string :default_output_format, default: "pdf" # pdf or docx

      t.jsonb :branding, default: {} # {primary: "#...", secondary: "#...", logo_url: "..."}
      t.jsonb :other, default: {}

      t.timestamps
    end
  end
end
