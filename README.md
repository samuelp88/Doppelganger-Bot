# Doppelganger-Bot
Interface web para controlar seu bot através do navegador como se estivesse conectado a uma conta do discord.

###### O que posso fazer?
A principio o objetivo é que através da interface seja possivel fazer qualquer coisa que seu bot faria normalmente, mas atualmente essas são as funcionalidades:
- Navegue por servidores e canais de maneira facil, rapida e intuitiva.
- Envie mensagens em quaisquer canais que seu bot tenha permissões.
- Envie mensagens privadas para usuarios que tenham pelo menos um servidor em comum com o seu bot.
- Novas funcionalidades serão adicionadas ao longo do tempo.

## Começando
### Instalação
```
git clone https://github.com/samuelp88/Doppelganger-Bot.git
```
### Necessário
```
node v14.15.3 ou superior
```

### Como usar
- Crie um arquivo **config.json** na pasta **/bot/**
- Copie o código logo abaixo e cole no **config.json** e então substitua o valor de **token** pelo **token do seu bot**.
- Depois de ter feito as etapas acima apenas execute o arquivo **run.bat**, abra o navegador e acesse ***localhost:3000***
#### config.json
```json
{
    "token": "token do seu bot aqui"
}
```
