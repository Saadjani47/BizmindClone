class AddExpToJwtDenylists < ActiveRecord::Migration[7.1]
  def change
    add_column :jwt_denylists, :exp, :datetime
    add_index :jwt_denylists, :exp
  end
end
