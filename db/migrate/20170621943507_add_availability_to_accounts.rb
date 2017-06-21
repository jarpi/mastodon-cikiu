class AddAvailabilityToAccounts < ActiveRecord::Migration[5.0]
  def change
    add_column :accounts, :availability, :string
  end
end
