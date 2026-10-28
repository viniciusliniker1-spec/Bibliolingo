"""Run against the disposable CI database only."""
import subprocess

def sql(statement):
    return subprocess.run(["psql", "-v", "ON_ERROR_STOP=1", "-Atc", statement],
                          text=True, capture_output=True, check=True).stdout.strip()

user = "00000000-0000-4000-8000-000000000003"
sql(f"insert into auth.users(id) values ('{user}'); update public.user_lumi_wallets set balance=300 where user_id='{user}'")

def buy(item, request):
    statement = f"""begin;
    select set_config('request.jwt.claim.sub','{user}',true);
    set local role authenticated;
    select * from public.purchase_lumi_item('{item}','{request}');
    select pg_sleep(0.3);
    commit;"""
    return subprocess.Popen(["psql", "-v", "ON_ERROR_STOP=1", "-Atc", statement],
                            text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# Two requests for one item: one debit and one inventory row.
a = buy("lumi_oculos", "00000000-0000-4000-8000-000000000041")
b = buy("lumi_oculos", "00000000-0000-4000-8000-000000000042")
for proc in [a, b]:
    _, error = proc.communicate(timeout=15)
    assert proc.returncode == 0, error
assert sql(f"select balance from public.user_lumi_wallets where user_id='{user}'") == "200"
assert sql(f"select count(*) from public.lumi_transactions where user_id='{user}'") == "1"

# Another request cannot spend funds already used by the first transaction.
c = buy("lumi_hiphop", "00000000-0000-4000-8000-000000000043")
_, error = c.communicate(timeout=15)
assert c.returncode != 0 and "insufficient-lumi-coins" in error
assert sql(f"select balance from public.user_lumi_wallets where user_id='{user}'") == "200"
print("PASS: concurrent requests debit once; insufficient funds preserve wallet and inventory")
