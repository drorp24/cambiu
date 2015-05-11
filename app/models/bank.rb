class Bank

  def self.exchange(amount, from, to)
    money = amount.to_money(from)
    money.exchange_to(to)
  end

end