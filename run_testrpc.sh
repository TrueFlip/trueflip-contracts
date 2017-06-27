# Accounts:
# 1. Owner account with 10 ETH
# 2. First investor with 1000000 ETH
# 3. Second investor with 1000 ETH

yarn run -- testrpc --account="0x83c14ddb845e629975e138a5c28ad5a72a49252ea65b3d3ec99810c82751cc3a,10000000000000000000" \
        --unlock "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a" \
        --account="0xd3b6b98613ce7bd4636c5c98cc17afb0403d690f9c2b646726e08334583de101,1000000000000000000000000" \
        --unlock "0xf1f42f995046e67b79dd5ebafd224ce964740da3" \
        --account="0xd10fa22a970f5c39538da5df9aaf6527052aad3e34364df1fdb5a5cf894ee4c0,1000000000000000000000" \
        --unlock "0xd646e8c228bfcc0ec6067ad909a34f14f45513b0" \
